// src/pages/Dashboard.tsx

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

import LoggedInUserContent from "../components/content/LoggedInUserContent";
import NonLoggedInUserContent from "../components/content/NonLoggedInUserContent";


interface Stats {
  totalPapers: number;
  correctRate: number;
  reviewDue: number;
  totalStorageKB: number;
  tagDistribution: Record<string, number>;
  weeklyProgress: { date: string; count: number }[];
  recentActivity: {
    id: string;
    type: "grade" | "practice";
    timestamp: string;
  }[];
}

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentKey, setContentKey] = useState(0); // コンポーネントを強制的に再レンダリングするためのキー

  // 認証状態が変更されたらコンテンツキーを更新して再レンダリングを強制
  useEffect(() => {
    setContentKey(prev => prev + 1);
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: papers, error } = await supabase
        .from("papers")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      if (!papers || papers.length === 0) {
        setStats({
          totalPapers: 0,
          correctRate: 0,
          reviewDue: 0,
          totalStorageKB: 0,
          tagDistribution: {},
          weeklyProgress: [],
          recentActivity: [],
        });
        setLoading(false);
        return;
      }

      // Review Due Count
      const reviewDue = papers.filter(
        (p) =>
          p.next_practice_date && new Date(p.next_practice_date) <= new Date()
      ).length;

      // Storage Calculation
      const totalStorageKB = papers.length * 200;

      // Tag Distribution
      const tagDistribution: Record<string, number> = {};
      papers.forEach((paper) => {
        paper.tags?.forEach((tag: string | number) => {
          tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
        });
      });

      // Weekly Progress
      const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        return {
          date: date.toISOString().split("T")[0],
          count: papers.filter(
            (p) =>
              p.last_practiced &&
              new Date(p.last_practiced) >= date &&
              new Date(p.last_practiced) < nextDate
          ).length,
        };
      }).reverse();

      // Recent Activity
      const recentActivity = papers
        .filter((p) => p.last_practiced)
        .map((p) => ({
          id: p.id,
          type: p.is_correct ? "grade" : "practice",
          timestamp: p.last_practiced!,
        }))
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);

      // Correct Rate
      const correctPapers = papers.filter((p) => p.is_correct).length;
      const correctRate = (correctPapers / (papers.length || 1)) * 100;

      setStats({
        totalPapers: papers.length,
        correctRate,
        reviewDue,
        totalStorageKB,
        tagDistribution,
        weeklyProgress,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, contentKey]); // contentKeyが変更されたときにも統計情報を再取得

  // 認証ローディング中は単純なローディング表示
  if (authLoading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  // ユーザー状態に基づいて適切なコンテンツを表示
  if (!user) {
    return <NonLoggedInUserContent />;
  }

  return loading ? (
    <p className="text-center text-gray-500">Loading...</p>
  ) : (
    <LoggedInUserContent
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stats={stats}
    />
  );
};