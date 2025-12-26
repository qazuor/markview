import { MainLayout } from '@/components/layout';
import { useTheme } from '@/hooks';
import { useDocumentStore } from '@/stores';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function App() {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const documents = useDocumentStore((state) => state.documents);
    const getActiveDocument = useDocumentStore((state) => state.getActiveDocument);
    const createDocument = useDocumentStore((state) => state.createDocument);

    const activeDocument = getActiveDocument();

    // Create initial document if none exists
    useEffect(() => {
        if (documents.size === 0) {
            createDocument();
        }
    }, [documents.size, createDocument]);

    return (
        <div className="flex h-screen flex-col bg-white text-secondary-900 dark:bg-secondary-950 dark:text-secondary-100">
            {/* Header */}
            <header className="flex h-12 items-center justify-between border-b border-secondary-200 px-4 dark:border-secondary-700">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-primary-600 dark:text-primary-400">{t('app.name')}</h1>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">{t('app.tagline')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">{isDark ? 'Dark' : 'Light'} mode</span>
                </div>
            </header>

            {/* Main content */}
            <main className="flex flex-1 overflow-hidden">
                {/* Sidebar placeholder */}
                <aside className="hidden w-64 border-r border-secondary-200 bg-secondary-50 p-4 dark:border-secondary-700 dark:bg-secondary-900 md:block">
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('sidebar.explorer')}</p>
                    <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-500">
                        {documents.size} {documents.size === 1 ? 'document' : 'documents'}
                    </p>
                </aside>

                {/* Editor and Preview */}
                <div className="flex flex-1 flex-col">
                    {/* Tab bar */}
                    <div className="flex h-10 items-center border-b border-secondary-200 bg-secondary-50 px-4 dark:border-secondary-700 dark:bg-secondary-900">
                        <span className="text-sm">
                            {activeDocument?.name ?? t('editor.untitled')}
                            {activeDocument?.isModified && <span className="ml-1 text-accent-500">•</span>}
                        </span>
                    </div>

                    {/* Split view with editor and preview */}
                    <MainLayout className="flex-1" />
                </div>
            </main>

            {/* Status bar */}
            <footer className="flex h-6 items-center justify-between border-t border-secondary-200 bg-secondary-50 px-4 text-xs text-secondary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-400">
                <span>
                    Ln {activeDocument?.cursor?.line ?? 1}, Col {activeDocument?.cursor?.column ?? 1}
                </span>
                <span>{activeDocument?.isModified ? t('editor.modified') : t('editor.saved')}</span>
            </footer>
        </div>
    );
}
