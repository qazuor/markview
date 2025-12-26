import { CheckSquare, List, ListOrdered } from 'lucide-react';
import { FormatButton } from '../FormatButton';

interface ListButtonProps {
    onList: (type: string) => void;
}

/**
 * Bullet list button
 */
export function BulletListButton({ onList }: ListButtonProps) {
    return <FormatButton icon={List} label="Bullet List" shortcut="Ctrl+Shift+8" onClick={() => onList('bulletList')} />;
}

/**
 * Numbered list button
 */
export function NumberedListButton({ onList }: ListButtonProps) {
    return <FormatButton icon={ListOrdered} label="Numbered List" shortcut="Ctrl+Shift+7" onClick={() => onList('numberedList')} />;
}

/**
 * Task/checkbox list button
 */
export function TaskListButton({ onList }: ListButtonProps) {
    return <FormatButton icon={CheckSquare} label="Task List" shortcut="Ctrl+Shift+9" onClick={() => onList('taskList')} />;
}
