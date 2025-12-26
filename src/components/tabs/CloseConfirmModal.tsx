import { Button, Modal, ModalFooter } from '@/components/ui';

interface CloseConfirmModalProps {
    isOpen: boolean;
    fileName: string;
    onAction: (action: 'save' | 'discard' | 'cancel') => void;
}

/**
 * Modal to confirm closing an unsaved document
 */
export function CloseConfirmModal({ isOpen, fileName, onAction }: CloseConfirmModalProps) {
    return (
        <Modal
            open={isOpen}
            onOpenChange={(open) => !open && onAction('cancel')}
            title="Unsaved changes"
            description={`Do you want to save the changes you made to "${fileName}"?`}
        >
            <p className="text-sm text-text-secondary">Your changes will be lost if you don&apos;t save them.</p>

            <ModalFooter>
                <Button variant="ghost" onClick={() => onAction('cancel')}>
                    Cancel
                </Button>
                <Button variant="outline" onClick={() => onAction('discard')}>
                    Don&apos;t Save
                </Button>
                <Button variant="primary" onClick={() => onAction('save')}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
}
