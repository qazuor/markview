import { Button, Modal, ModalFooter } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface CloseConfirmModalProps {
    isOpen: boolean;
    fileName: string;
    onAction: (action: 'save' | 'discard' | 'cancel') => void;
}

/**
 * Modal to confirm closing an unsaved document
 */
export function CloseConfirmModal({ isOpen, fileName, onAction }: CloseConfirmModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onAction('cancel')}
            title={t('confirm.unsavedChangesTitle')}
            description={t('confirm.unsavedChangesDescription', { fileName })}
        >
            <p className="text-sm text-text-secondary">{t('confirm.unsavedChangesWarning')}</p>

            <ModalFooter>
                <Button variant="ghost" onClick={() => onAction('cancel')}>
                    {t('common.cancel')}
                </Button>
                <Button variant="outline" onClick={() => onAction('discard')}>
                    {t('confirm.dontSave')}
                </Button>
                <Button variant="primary" onClick={() => onAction('save')}>
                    {t('common.save')}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
