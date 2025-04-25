import {
  BookOpen,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Database,
  Tag as TagIcon,
  TrendingUp,
} from "lucide-react";

interface Stats {
  totalPapers: number;
  totalStorageKB: number;
  reviewDue: number;
  weeklyProgress: { date: string; count: number }[];
  recentActivity: { id: string; type: string; timestamp: string }[];
}

const StatCard = ({
  icon: Icon,
  color,
  title,
  value,
  unit,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  value: number;
  unit: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
    <Icon className={`w-8 h-8 ${color}`} />
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">
        {value.toLocaleString()}
        <span className="text-base ml-1">{unit}</span>
      </p>
    </div>
  </div>
);

const ProgressBar = ({ date, count }: { date: string; count: number }) => (
  <div className="flex-1 flex flex-col items-center">
    <div
      className="w-full bg-indigo-100 rounded-t"
      style={{
        height: `${Math.max((count / 20) * 100, 5)}%`,
        transition: "height 0.3s ease-in-out",
      }}
    />
    <div className="mt-2 text-xs text-gray-500 rotate-45 origin-left">
      {new Date(date).toLocaleDateString("ja-JP", { weekday: "short" })}
    </div>
  </div>
);

const ActivityItem = ({
  type,
  timestamp,
}: {
  type: string;
  timestamp: string;
}) => {
  const activityMap = {
    grade: {
      text: "問題を採点しました",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    practice: {
      text: "問題を演習しました",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    upload: {
      text: "問題をアップロードしました",
      icon: TagIcon,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  };

  const {
    text,
    icon: Icon,
    color,
    bg,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  } = activityMap[type] || activityMap.upload;

  return (
    <div className="flex items-center space-x-4">
      <div className={`p-2 rounded-full ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{text}</p>
        <p className="text-xs text-gray-500">
          {new Date(timestamp).toLocaleString("ja-JP")}
        </p>
      </div>
    </div>
  );
};

const LoggedInUserContent = ({ stats }: { stats?: Stats }) => {
  if (!stats) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-center text-red-500 mb-4">⚠️ データが見つかりません</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          color="text-indigo-600"
          title="総問題数"
          value={stats.totalPapers || 0}
          unit="ページ"
        />
        <StatCard
          icon={Database}
          color="text-blue-600"
          title="総データ量"
          value={stats.totalStorageKB || 0}
          unit="KB"
        />
        <StatCard
          icon={Calendar}
          color="text-red-600"
          title="復習予定"
          value={stats.reviewDue || 0}
          unit="ページ"
        />
      </div>

      {/* Graph & Analysis */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <TrendingUp className="w-5 h-5 inline-block mr-2 text-indigo-600" />
            週間進捗
          </h3>
          <div className="h-64 flex items-end space-x-2">
            {stats.weeklyProgress?.length ? (
              stats.weeklyProgress.map(({ date, count }) => (
                <ProgressBar key={date} date={date} count={count} />
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">
                データがありません
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <BrainCircuit className="w-5 h-5 inline-block mr-2 text-indigo-600" />
            最近のアクティビティ
          </h3>
          <div className="space-y-4">
            {stats.recentActivity?.length ? (
              stats.recentActivity.map(({ id, type, timestamp }) => (
                <ActivityItem key={id} type={type} timestamp={timestamp} />
              ))
            ) : (
              <p className="text-gray-500 text-center">
                アクティビティがありません
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedInUserContent;
