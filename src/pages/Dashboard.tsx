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
    type: "grade" | "practice" | "upload";
    timestamp: string;
  }[];
}

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentKey, setContentKey] = useState(0);
  // Add state to track if stats fetch has been attempted
  const [fetchAttempted, setFetchAttempted] = useState(false);
  // Add state to track any fetch errors
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 認証状態が変更されたらコンテンツキーを更新して再レンダリングを強制
  useEffect(() => {
    setContentKey(prev => prev + 1);
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setFetchAttempted(true);
      return;
    }

    setFetchError(null);
    try {
      console.log("Fetching stats for user:", user.id);
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
          weeklyProgress: generateEmptyWeeklyProgress(),
          recentActivity: [],
        });
        setLoading(false);
        setFetchAttempted(true);
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
      const weeklyProgress = generateWeeklyProgress(papers);

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
      console.log("Stats fetched successfully:", papers.length, "papers");
    } catch (error) {
      console.error("Error fetching stats:", error);
      setFetchError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
      setFetchAttempted(true);
    }
  }, [user]);

  // Helper function to generate empty weekly progress data
  const generateEmptyWeeklyProgress = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return {
        date: date.toISOString().split("T")[0],
        count: 0
      };
    }).reverse();
  };

  // Helper function to generate weekly progress data
  const generateWeeklyProgress = (papers: any[]) => {
    return Array.from({ length: 7 }, (_, i) => {
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
        ).length
      };
    }).reverse();
  };

  useEffect(() => {
    // Only fetch stats if auth is not loading and we have a clear user state
    if (!authLoading) {
      console.log("Auth state ready, fetching stats...");
      fetchStats();
    }
  }, [fetchStats, contentKey, authLoading]);

  // Show clear loading state when authentication is still loading
  if (authLoading) {
    console.log("Auth loading, showing loader");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // Show loader when fetching stats
  if (loading && !fetchAttempted) {
    console.log("Stats loading, showing loader");
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-500">データを読み込み中...</p>
      </div>
    );
  }

  // Show error message if fetch failed
  if (fetchError) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg mx-auto">
          <p className="text-red-600 mb-2">データの読み込みに失敗しました</p>
          <p className="text-red-500 text-sm mb-4">{fetchError}</p>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // ユーザー状態に基づいて適切なコンテンツを表示
  if (!user) {
    console.log("No user, showing non-logged in content");
    return <NonLoggedInUserContent />;
  }

  console.log("User authenticated, showing logged in content");
  return (
    <LoggedInUserContent
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stats={stats}
    />
  );
};