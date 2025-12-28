/**
 * Process task list checkboxes to make them interactive
 * Toggles the checkbox state and updates the markdown content
 */
export function processChecklists(container: HTMLElement, onToggle: (lineNumber: number, checked: boolean) => void): void {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    for (const checkbox of checkboxes) {
        // Skip if already processed
        if (checkbox.classList.contains('checklist-processed')) continue;
        checkbox.classList.add('checklist-processed');

        // Make the checkbox interactive
        (checkbox as HTMLInputElement).disabled = false;

        // Find the line number by counting list items
        const listItem = checkbox.closest('li');
        if (!listItem) continue;

        // Find the line number from the source map
        const lineNumber = findLineNumber(listItem);

        // Style the checkbox
        checkbox.classList.add(
            'cursor-pointer',
            'rounded',
            'border-secondary-400',
            'text-primary-500',
            'focus:ring-primary-500',
            'focus:ring-2',
            'focus:ring-offset-1'
        );

        // Add change handler
        checkbox.addEventListener('change', (e) => {
            const input = e.target as HTMLInputElement;
            onToggle(lineNumber, input.checked);

            // Update visual state of the list item
            if (input.checked) {
                listItem.classList.add('line-through', 'text-secondary-400');
            } else {
                listItem.classList.remove('line-through', 'text-secondary-400');
            }
        });

        // Set initial visual state
        if ((checkbox as HTMLInputElement).checked) {
            listItem.classList.add('line-through', 'text-secondary-400');
        }
    }
}

/**
 * Find the approximate line number for a list item
 * This is an estimation based on the position in the content
 */
function findLineNumber(listItem: Element): number {
    // Get all list items up to this one
    const allListItems = listItem.closest('.preview-content')?.querySelectorAll('li');
    if (!allListItems) return 0;

    let taskItemIndex = 0;
    for (const item of allListItems) {
        if (item.querySelector('input[type="checkbox"]')) {
            taskItemIndex++;
            if (item === listItem) break;
        }
    }

    return taskItemIndex;
}

/**
 * Toggle a checkbox in markdown content
 * Returns the new content with the toggled checkbox
 */
export function toggleCheckboxInContent(content: string, taskIndex: number, checked: boolean): string {
    const lines = content.split('\n');
    let currentTaskIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        // Match task list items: - [ ] or - [x] or * [ ] or * [x]
        const taskMatch = line.match(/^(\s*[-*+]\s*)\[([ xX])\](.*)$/);

        if (taskMatch) {
            currentTaskIndex++;
            if (currentTaskIndex === taskIndex) {
                const prefix = taskMatch[1] ?? '';
                const suffix = taskMatch[3] ?? '';
                lines[i] = `${prefix}[${checked ? 'x' : ' '}]${suffix}`;
                break;
            }
        }
    }

    return lines.join('\n');
}
