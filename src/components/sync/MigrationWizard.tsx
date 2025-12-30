/**
 * Migration Wizard
 * Guides users through migrating local documents to cloud sync
 */

import { useAuth } from '@/components/auth/AuthProvider';
import { syncService } from '@/services/sync';
import { useDocumentStore } from '@/stores/documentStore';
import type { Document } from '@/types';
import { cn } from '@/utils/cn';
import { Check, ChevronRight, Cloud, FileText, Loader2, Upload } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from '../ui/Modal';

interface MigrationWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'intro' | 'select' | 'migrate' | 'complete';

export function MigrationWizard({ isOpen, onClose }: MigrationWizardProps) {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const documents = useDocumentStore((s) => s.documents);

    const [step, setStep] = useState<Step>('intro');
    const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
    const [migratingDocs, setMigratingDocs] = useState<Set<string>>(new Set());
    const [migratedDocs, setMigratedDocs] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    // Get local documents that haven't been synced yet
    const localDocuments = useMemo(() => {
        return Array.from(documents.values()).filter((doc) => doc.source === 'local' && !doc.syncVersion);
    }, [documents]);

    const handleSelectAll = useCallback(() => {
        if (selectedDocs.size === localDocuments.length) {
            setSelectedDocs(new Set());
        } else {
            setSelectedDocs(new Set(localDocuments.map((d) => d.id)));
        }
    }, [localDocuments, selectedDocs.size]);

    const handleToggleDoc = useCallback((id: string) => {
        setSelectedDocs((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleMigrate = useCallback(async () => {
        if (selectedDocs.size === 0) return;

        setStep('migrate');
        setError(null);

        for (const docId of selectedDocs) {
            setMigratingDocs((prev) => new Set(prev).add(docId));

            const doc = documents.get(docId);
            if (!doc) continue;

            try {
                // Queue document for sync
                syncService.queueDocumentSync({
                    id: doc.id,
                    name: doc.name,
                    content: doc.content,
                    folderId: doc.folderId ?? null,
                    isManuallyNamed: doc.isManuallyNamed,
                    cursor: doc.cursor,
                    scroll: doc.scroll,
                    syncVersion: 0
                });

                setMigratedDocs((prev) => new Set(prev).add(docId));
            } catch (err) {
                console.error(`Failed to migrate document ${docId}:`, err);
                setError(err instanceof Error ? err.message : 'Migration failed');
            } finally {
                setMigratingDocs((prev) => {
                    const next = new Set(prev);
                    next.delete(docId);
                    return next;
                });
            }
        }

        // Process the queue
        await syncService.processQueue();

        setStep('complete');
    }, [selectedDocs, documents]);

    const handleClose = useCallback(() => {
        setStep('intro');
        setSelectedDocs(new Set());
        setMigratingDocs(new Set());
        setMigratedDocs(new Set());
        setError(null);
        onClose();
    }, [onClose]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('sync.migration.title')} size="lg">
            {step === 'intro' && <IntroStep documentCount={localDocuments.length} onNext={() => setStep('select')} onSkip={handleClose} />}

            {step === 'select' && (
                <SelectStep
                    documents={localDocuments}
                    selectedDocs={selectedDocs}
                    onToggleDoc={handleToggleDoc}
                    onSelectAll={handleSelectAll}
                    onNext={handleMigrate}
                    onBack={() => setStep('intro')}
                />
            )}

            {step === 'migrate' && (
                <MigrateStep
                    documents={localDocuments}
                    selectedDocs={selectedDocs}
                    migratingDocs={migratingDocs}
                    migratedDocs={migratedDocs}
                    error={error}
                />
            )}

            {step === 'complete' && <CompleteStep migratedCount={migratedDocs.size} onClose={handleClose} />}
        </Modal>
    );
}

interface IntroStepProps {
    documentCount: number;
    onNext: () => void;
    onSkip: () => void;
}

function IntroStep({ documentCount, onNext, onSkip }: IntroStepProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 mb-4">
                    <Cloud className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">{t('sync.migration.intro.title')}</h3>
                <p className="text-text-secondary max-w-md mx-auto">{t('sync.migration.intro.description')}</p>
            </div>

            <div className="grid gap-4">
                <FeatureItem icon={<Upload className="h-5 w-5" />} title={t('sync.migration.feature.backup')} />
                <FeatureItem icon={<Cloud className="h-5 w-5" />} title={t('sync.migration.feature.access')} />
                <FeatureItem icon={<Check className="h-5 w-5" />} title={t('sync.migration.feature.sync')} />
            </div>

            {documentCount > 0 && (
                <p className="text-center text-sm text-text-muted">{t('sync.migration.documentsFound', { count: documentCount })}</p>
            )}

            <ModalFooter>
                <button
                    type="button"
                    onClick={onSkip}
                    className={cn(
                        'px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'text-text-secondary hover:text-text-primary',
                        'hover:bg-bg-tertiary',
                        'transition-colors'
                    )}
                >
                    {t('sync.migration.skipForNow')}
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={documentCount === 0}
                    className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'bg-primary-500 text-white',
                        'hover:bg-primary-600',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors'
                    )}
                >
                    {t('sync.migration.getStarted')}
                    <ChevronRight className="h-4 w-4" />
                </button>
            </ModalFooter>
        </div>
    );
}

interface SelectStepProps {
    documents: Document[];
    selectedDocs: Set<string>;
    onToggleDoc: (id: string) => void;
    onSelectAll: () => void;
    onNext: () => void;
    onBack: () => void;
}

function SelectStep({ documents, selectedDocs, onToggleDoc, onSelectAll, onNext, onBack }: SelectStepProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">{t('sync.migration.selectDocuments')}</p>
                <button type="button" onClick={onSelectAll} className="text-sm text-primary-500 hover:text-primary-600">
                    {selectedDocs.size === documents.length ? t('common.deselectAll') : t('common.selectAll')}
                </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
                {documents.map((doc) => (
                    <label
                        key={doc.id}
                        className={cn(
                            'flex items-center gap-3 p-3 rounded-lg cursor-pointer',
                            'hover:bg-bg-tertiary',
                            selectedDocs.has(doc.id) && 'bg-primary-500/10'
                        )}
                    >
                        <input
                            type="checkbox"
                            checked={selectedDocs.has(doc.id)}
                            onChange={() => onToggleDoc(doc.id)}
                            className="rounded border-border text-primary-500 focus:ring-primary-500"
                        />
                        <FileText className="h-4 w-4 text-text-muted" />
                        <span className="text-text-primary flex-1 truncate">{doc.name}</span>
                        <span className="text-xs text-text-muted">{formatFileSize(doc.content.length)}</span>
                    </label>
                ))}
            </div>

            <ModalFooter>
                <button
                    type="button"
                    onClick={onBack}
                    className={cn(
                        'px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'text-text-secondary hover:text-text-primary',
                        'hover:bg-bg-tertiary',
                        'transition-colors'
                    )}
                >
                    {t('common.back')}
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={selectedDocs.size === 0}
                    className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'bg-primary-500 text-white',
                        'hover:bg-primary-600',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors'
                    )}
                >
                    <Upload className="h-4 w-4" />
                    {t('sync.migration.migrate', { count: selectedDocs.size })}
                </button>
            </ModalFooter>
        </div>
    );
}

interface MigrateStepProps {
    documents: Document[];
    selectedDocs: Set<string>;
    migratingDocs: Set<string>;
    migratedDocs: Set<string>;
    error: string | null;
}

function MigrateStep({ documents, selectedDocs, migratingDocs, migratedDocs, error }: MigrateStepProps) {
    const { t } = useTranslation();

    const selectedDocuments = documents.filter((d) => selectedDocs.has(d.id));

    return (
        <div className="space-y-4">
            <div className="text-center py-4">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-2" />
                <p className="text-text-primary font-medium">{t('sync.migration.migrating')}</p>
                <p className="text-sm text-text-muted">
                    {migratedDocs.size} / {selectedDocs.size} {t('sync.migration.complete')}
                </p>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1">
                {selectedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg">
                        {migratedDocs.has(doc.id) ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : migratingDocs.has(doc.id) ? (
                            <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                        ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-border" />
                        )}
                        <span className={cn('text-sm', migratedDocs.has(doc.id) ? 'text-text-muted' : 'text-text-primary')}>
                            {doc.name}
                        </span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}
        </div>
    );
}

interface CompleteStepProps {
    migratedCount: number;
    onClose: () => void;
}

function CompleteStep({ migratedCount, onClose }: CompleteStepProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                    <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">{t('sync.migration.success.title')}</h3>
                <p className="text-text-secondary">{t('sync.migration.success.description', { count: migratedCount })}</p>
            </div>

            <ModalFooter>
                <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                        'px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'bg-primary-500 text-white',
                        'hover:bg-primary-600',
                        'transition-colors'
                    )}
                >
                    {t('common.done')}
                </button>
            </ModalFooter>
        </div>
    );
}

function FeatureItem({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
            <span className="text-primary-500">{icon}</span>
            <span className="text-text-primary">{title}</span>
        </div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
