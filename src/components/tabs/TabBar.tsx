import { IconButton } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CloseConfirmModal } from './CloseConfirmModal';
import { Tab } from './Tab';
import { useTabs } from './hooks/useTabs';

interface TabBarProps {
    className?: string;
}

/**
 * Tab bar container with scroll and overflow handling
 */
export function TabBar({ className }: TabBarProps) {
    const { tabs, activeTab, selectTab, closeTab, forceCloseTab, addTab, tabCount } = useTabs();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const [closeConfirm, setCloseConfirm] = useState<{
        isOpen: boolean;
        tabId: string | null;
        tabName: string;
    }>({
        isOpen: false,
        tabId: null,
        tabName: ''
    });

    // Check scroll overflow
    const checkOverflow = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
    }, []);

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [checkOverflow]);

    // Re-check overflow when tabs change
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally rerun when tabCount changes
    useEffect(() => {
        checkOverflow();
    }, [tabCount, checkOverflow]);

    const scrollLeft = () => {
        scrollContainerRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 150, behavior: 'smooth' });
    };

    const handleTabClose = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        const result = closeTab(tabId);

        if (result.requiresConfirmation && result.document) {
            setCloseConfirm({
                isOpen: true,
                tabId,
                tabName: result.document.name
            });
        }
    };

    const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
        e.preventDefault();
        handleTabClose(e, tabId);
    };

    const handleConfirmClose = (action: 'save' | 'discard' | 'cancel') => {
        if (action === 'discard' && closeConfirm.tabId) {
            forceCloseTab(closeConfirm.tabId);
        }
        // For 'save', the parent component should handle the save operation
        // For now, we just close the modal

        setCloseConfirm({ isOpen: false, tabId: null, tabName: '' });
    };

    return (
        <div className={cn('flex items-center bg-bg-secondary border-b border-border', className)} role="tablist">
            {/* Left scroll button */}
            {showLeftArrow && (
                <IconButton
                    icon={<ChevronLeft className="h-4 w-4" />}
                    label="Scroll tabs left"
                    onClick={scrollLeft}
                    size="sm"
                    className="shrink-0"
                />
            )}

            {/* Tabs container */}
            <div ref={scrollContainerRef} onScroll={checkOverflow} className="flex-1 flex items-stretch overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        id={tab.id}
                        name={tab.name}
                        isActive={tab.id === activeTab}
                        isModified={tab.isModified}
                        onClick={() => selectTab(tab.id)}
                        onClose={(e) => handleTabClose(e, tab.id)}
                        onMiddleClick={(e) => handleMiddleClick(e, tab.id)}
                    />
                ))}
            </div>

            {/* Right scroll button */}
            {showRightArrow && (
                <IconButton
                    icon={<ChevronRight className="h-4 w-4" />}
                    label="Scroll tabs right"
                    onClick={scrollRight}
                    size="sm"
                    className="shrink-0"
                />
            )}

            {/* Add new tab button */}
            <IconButton icon={<Plus className="h-4 w-4" />} label="New document" onClick={addTab} size="sm" className="shrink-0 mx-1" />

            {/* Close confirmation modal */}
            <CloseConfirmModal isOpen={closeConfirm.isOpen} fileName={closeConfirm.tabName} onAction={handleConfirmClose} />
        </div>
    );
}
