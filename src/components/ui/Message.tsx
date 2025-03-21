// components/ui/Message.tsx
import { AlertCircle, CheckCircle } from 'lucide-react';
import React from 'react';

type MessageType = 'success' | 'error' | 'info' | 'warning';

interface MessageProps {
    type: MessageType;
    title?: string;
    children: React.ReactNode;
}

/**
 * メッセージコンポーネント
 */
export const Message: React.FC<MessageProps> = ({
    type,
    title,
    children
}) => {
    // タイプに応じたスタイルとアイコン
    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-700',
            icon: CheckCircle
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
            icon: AlertCircle
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-700',
            icon: AlertCircle
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-700',
            icon: AlertCircle
        }
    };

    const { bg, border, text, icon: Icon } = styles[type];

    return (
        <div className={`p-4 rounded-md border ${bg} ${border} ${text}`}>
            <div className="flex">
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                    {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
                    <div className="text-sm">{children}</div>
                </div>
            </div>
        </div>
    );
};
