import { Button, Modal, ModalFooter } from '@/components/ui';
import type { FolderIconName } from '@/stores/folderStore';
import { FOLDER_COLORS, FOLDER_ICONS, useFolderStore } from '@/stores/folderStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import * as Icons from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Map icon names to their components
const iconMap: Record<string, Icons.LucideIcon> = {
    folder: Icons.Folder,
    archive: Icons.Archive,
    book: Icons.Book,
    bookmark: Icons.Bookmark,
    briefcase: Icons.Briefcase,
    calendar: Icons.Calendar,
    camera: Icons.Camera,
    code: Icons.Code,
    coffee: Icons.Coffee,
    cog: Icons.Cog,
    database: Icons.Database,
    'file-text': Icons.FileText,
    film: Icons.Film,
    'gamepad-2': Icons.Gamepad2,
    gift: Icons.Gift,
    globe: Icons.Globe,
    'graduation-cap': Icons.GraduationCap,
    heart: Icons.Heart,
    home: Icons.Home,
    image: Icons.Image,
    inbox: Icons.Inbox,
    laptop: Icons.Laptop,
    layers: Icons.Layers,
    library: Icons.Library,
    lightbulb: Icons.Lightbulb,
    mail: Icons.Mail,
    map: Icons.Map,
    music: Icons.Music,
    package: Icons.Package,
    'pen-tool': Icons.PenTool,
    rocket: Icons.Rocket,
    search: Icons.Search,
    settings: Icons.Settings,
    shield: Icons.Shield,
    'shopping-bag': Icons.ShoppingBag,
    star: Icons.Star,
    tag: Icons.Tag,
    target: Icons.Target,
    terminal: Icons.Terminal,
    trophy: Icons.Trophy,
    user: Icons.User,
    wallet: Icons.Wallet,
    zap: Icons.Zap
};

export function getIconComponent(iconName: string | null): Icons.LucideIcon {
    if (!iconName || !iconMap[iconName]) {
        return Icons.Folder;
    }
    return iconMap[iconName];
}

/**
 * Modal for creating a new folder with name, color, and icon selection
 */
export function NewFolderModal() {
    const { t } = useTranslation();
    const activeModal = useUIStore((s) => s.activeModal);
    const closeModal = useUIStore((s) => s.closeModal);
    const parentFolderId = useUIStore((s) => s.newFolderParentId);
    const createFolder = useFolderStore((s) => s.createFolder);

    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<FolderIconName | null>(null);

    const isOpen = activeModal === 'new-folder';

    const handleClose = useCallback(() => {
        closeModal();
        // Reset state after closing
        setTimeout(() => {
            setName('');
            setSelectedColor(null);
            setSelectedIcon(null);
        }, 200);
    }, [closeModal]);

    const handleCreate = useCallback(() => {
        if (!name.trim()) return;

        createFolder({
            name: name.trim(),
            parentId: parentFolderId,
            color: selectedColor,
            icon: selectedIcon
        });

        handleClose();
    }, [name, parentFolderId, selectedColor, selectedIcon, createFolder, handleClose]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && name.trim()) {
                handleCreate();
            }
        },
        [name, handleCreate]
    );

    const PreviewIcon = getIconComponent(selectedIcon);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('fileExplorer.folder.new')} size="md">
            <div className="space-y-6">
                {/* Folder name input */}
                <div className="space-y-2">
                    <label htmlFor="folder-name" className="block text-sm font-medium text-text-secondary">
                        {t('fileExplorer.folder.name')}
                    </label>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-tertiary"
                            style={{ color: selectedColor || 'var(--color-text-muted)' }}
                        >
                            <PreviewIcon className="h-5 w-5" />
                        </div>
                        <input
                            id="folder-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('fileExplorer.folder.namePlaceholder')}
                            className={cn(
                                'flex-1 px-3 py-2 rounded-md',
                                'bg-bg-secondary border border-border',
                                'text-text-primary placeholder:text-text-muted',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                            )}
                        />
                    </div>
                </div>

                {/* Color selection */}
                <div className="space-y-2">
                    <span className="block text-sm font-medium text-text-secondary">{t('fileExplorer.folder.color')}</span>
                    <div className="flex flex-wrap gap-2">
                        {/* No color option */}
                        <button
                            type="button"
                            onClick={() => setSelectedColor(null)}
                            className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center',
                                'border-2 transition-all',
                                selectedColor === null ? 'border-primary-500 scale-110' : 'border-transparent hover:border-border'
                            )}
                            aria-label={t('fileExplorer.folder.noColor')}
                        >
                            <Icons.Circle className="h-5 w-5 text-text-muted" />
                        </button>
                        {/* Color options */}
                        {FOLDER_COLORS.map((color) => (
                            <button
                                key={color.name}
                                type="button"
                                onClick={() => setSelectedColor(color.value)}
                                className={cn(
                                    'w-7 h-7 rounded-full transition-all',
                                    'border-2',
                                    selectedColor === color.value ? 'border-text-primary scale-110' : 'border-transparent hover:scale-105'
                                )}
                                style={{ backgroundColor: color.value }}
                                aria-label={color.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Icon selection */}
                <div className="space-y-2">
                    <span className="block text-sm font-medium text-text-secondary">{t('fileExplorer.folder.icon')}</span>
                    <div className="grid grid-cols-9 gap-1 max-h-40 overflow-y-auto p-1 bg-bg-secondary rounded-lg">
                        {FOLDER_ICONS.map((iconName) => {
                            const IconComponent = iconMap[iconName];
                            if (!IconComponent) return null;

                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setSelectedIcon(iconName === 'folder' ? null : iconName)}
                                    className={cn(
                                        'p-2 rounded-md transition-all',
                                        'hover:bg-bg-tertiary',
                                        (selectedIcon === iconName || (selectedIcon === null && iconName === 'folder')) &&
                                            'bg-primary-500/20 text-primary-500'
                                    )}
                                    aria-label={iconName}
                                >
                                    <IconComponent className="h-4 w-4" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <ModalFooter>
                <Button variant="outline" onClick={handleClose}>
                    {t('common.cancel')}
                </Button>
                <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>
                    {t('common.create')}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
