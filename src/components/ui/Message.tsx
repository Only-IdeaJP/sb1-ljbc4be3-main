// src/components/ui/Message.tsx
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import React from "react";

export type MessageType = "success" | "error" | "info" | "warning";

interface MessageProps {
    /**
     * メッセージの種類
     */
    type: MessageType;
    /**
     * メッセージの内容
     */
    text: string;
    /**
     * 改行を保持するかどうか
     */
    preserveWhitespace?: boolean;
    /**
     * 追加のCSSクラス
     */
    className?: string;
}

/**
 * 各種アラートメッセージを表示するコンポーネント
 */
export const Message: React.FC<MessageProps> = ({
    type,
    text,
    preserveWhitespace = false,
    className = "",
}) => {
    // タイプに応じたスタイル設定
    const styles = {
        success: {
            bg: "bg-green-50",
            text: "text-green-700",
            icon: CheckCircle,
        },
        error: {
            bg: "bg-red-50",
            text: "text-red-700",
            icon: AlertCircle,
        },
        info: {
            bg: "bg-blue-50",
            text: "text-blue-700",
            icon: Info,
        },
        warning: {
            bg: "bg-yellow-50",
            text: "text-yellow-700",
            icon: AlertTriangle,
        },
    };

    const { bg, text: textColor, icon: Icon } = styles[type];

    return (
        <div className={`p-4 rounded-md ${bg} ${textColor} ${className}`}>
            <div className="flex">
                <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
                {preserveWhitespace ? (
                    <pre className="whitespace-pre-wrap font-sans">{text}</pre>
                ) : (
                    <p>{text}</p>
                )}
            </div>
        </div>
    );
};