import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { validateFilename } from '@/utils/filename';
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

interface EditableTabNameProps {
    documentId: string;
    name: string;
    isActive: boolean;
    className?: string;
}

/**
 * Editable document name in tab with double-click to edit
 */
export function EditableTabName({ documentId, name, isActive, className }: EditableTabNameProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(name);
    const [error, setError] = useState<string | null>(null);
    const [isNewDocumentRename, setIsNewDocumentRename] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const renameDocument = useDocumentStore((s) => s.renameDocument);
    const getDocument = useDocumentStore((s) => s.getDocument);
    const updateContent = useDocumentStore((s) => s.updateContent);
    const pendingRenameDocumentId = useUIStore((s) => s.pendingRenameDocumentId);
    const setPendingRenameDocumentId = useUIStore((s) => s.setPendingRenameDocumentId);

    const startEditing = useCallback(
        (isNewDocument = false) => {
            setEditValue(name);
            setError(null);
            setIsNewDocumentRename(isNewDocument);
            setIsEditing(true);
        },
        [name]
    );

    const cancelEditing = useCallback(() => {
        setEditValue(name);
        setError(null);
        setIsNewDocumentRename(false);
        setIsEditing(false);
    }, [name]);

    // Auto-start editing when this document is flagged for rename (new document)
    useEffect(() => {
        if (pendingRenameDocumentId === documentId && !isEditing) {
            startEditing(true);
            setPendingRenameDocumentId(null);
        }
    }, [pendingRenameDocumentId, documentId, isEditing, startEditing, setPendingRenameDocumentId]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Update editValue when name prop changes
    useEffect(() => {
        if (!isEditing) {
            setEditValue(name);
        }
    }, [name, isEditing]);

    const saveEdit = useCallback(() => {
        const trimmed = editValue.trim();

        // Validate
        const validation = validateFilename(trimmed);
        if (!validation.valid) {
            setError(validation.error ?? 'Invalid name');
            return;
        }

        // Save the name
        renameDocument(documentId, trimmed, true);

        // If this is a new document and content is empty, add H1 heading with the name
        if (isNewDocumentRename) {
            const doc = getDocument(documentId);
            if (doc && !doc.content.trim()) {
                updateContent(documentId, `# ${trimmed}\n\n`);
            }
        }

        setIsEditing(false);
        setIsNewDocumentRename(false);
        setError(null);
    }, [editValue, documentId, renameDocument, isNewDocumentRename, getDocument, updateContent]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEditing();
            }
        },
        [saveEdit, cancelEditing]
    );

    const handleBlur = useCallback(() => {
        // Only save if there's no error and value has changed
        if (!error && editValue.trim() !== name) {
            saveEdit();
        } else {
            cancelEditing();
        }
    }, [error, editValue, name, saveEdit, cancelEditing]);

    // Use a fixed-size container to prevent layout shifts during editing
    return (
        <div className={cn('relative min-w-0', className)}>
            {isEditing ? (
                <>
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => {
                            setEditValue(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        className={cn(
                            'absolute inset-y-0 left-0 right-0',
                            'px-2 py-1 text-sm',
                            'bg-bg-primary rounded',
                            'border border-solid',
                            error ? 'border-red-500' : 'border-primary-500',
                            'focus:outline-none focus:ring-1 focus:ring-primary-500'
                        )}
                        style={{ margin: '-2px -4px', width: 'calc(100% + 8px)' }}
                    />
                    {/* Invisible text to maintain height - actual width comes from container */}
                    <span className="block truncate invisible" aria-hidden="true">
                        {name || 'X'}
                    </span>
                    {error && (
                        <div className="absolute left-0 top-full mt-1 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg whitespace-nowrap z-50">
                            {error}
                        </div>
                    )}
                </>
            ) : (
                <span
                    onDoubleClick={() => startEditing(false)}
                    className={cn('block truncate cursor-default', isActive ? 'text-text-primary' : 'text-text-secondary')}
                    title={name}
                >
                    {name}
                </span>
            )}
        </div>
    );
}
