import { processChecklists, toggleCheckboxInContent } from '@/components/preview/Checklist';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('toggleCheckboxInContent', () => {
    describe('basic toggling', () => {
        it('should check unchecked checkbox', () => {
            const content = '- [ ] Task 1';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('- [x] Task 1');
        });

        it('should uncheck checked checkbox', () => {
            const content = '- [x] Task 1';
            const result = toggleCheckboxInContent(content, 1, false);

            expect(result).toBe('- [ ] Task 1');
        });

        it('should handle lowercase x', () => {
            const content = '- [x] Task 1';
            const result = toggleCheckboxInContent(content, 1, false);

            expect(result).toBe('- [ ] Task 1');
        });

        it('should handle uppercase X', () => {
            const content = '- [X] Task 1';
            const result = toggleCheckboxInContent(content, 1, false);

            expect(result).toBe('- [ ] Task 1');
        });
    });

    describe('multiple checkboxes', () => {
        it('should toggle first checkbox', () => {
            const content = '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('- [x] Task 1\n- [ ] Task 2\n- [ ] Task 3');
        });

        it('should toggle second checkbox', () => {
            const content = '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3';
            const result = toggleCheckboxInContent(content, 2, true);

            expect(result).toBe('- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3');
        });

        it('should toggle third checkbox', () => {
            const content = '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3';
            const result = toggleCheckboxInContent(content, 3, true);

            expect(result).toBe('- [ ] Task 1\n- [ ] Task 2\n- [x] Task 3');
        });
    });

    describe('different list markers', () => {
        it('should handle asterisk marker', () => {
            const content = '* [ ] Task with asterisk';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('* [x] Task with asterisk');
        });

        it('should handle plus marker', () => {
            const content = '+ [ ] Task with plus';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('+ [x] Task with plus');
        });

        it('should handle dash marker', () => {
            const content = '- [ ] Task with dash';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('- [x] Task with dash');
        });
    });

    describe('indented lists', () => {
        it('should handle indented checkboxes', () => {
            const content = '  - [ ] Indented task';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('  - [x] Indented task');
        });

        it('should handle multiple levels of indentation', () => {
            const content = '    - [ ] Deeply indented';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('    - [x] Deeply indented');
        });
    });

    describe('mixed content', () => {
        it('should only toggle task list items', () => {
            const content = '# Header\n\n- [ ] Task\n\nSome text';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('# Header\n\n- [x] Task\n\nSome text');
        });

        it('should ignore regular list items', () => {
            const content = '- Regular item\n- [ ] Task item';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('- Regular item\n- [x] Task item');
        });
    });

    describe('edge cases', () => {
        it('should handle empty content', () => {
            const content = '';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('');
        });

        it('should handle no checkboxes', () => {
            const content = 'Just some text';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('Just some text');
        });

        it('should handle non-existent index', () => {
            const content = '- [ ] Task 1';
            const result = toggleCheckboxInContent(content, 99, true);

            // Should not change anything
            expect(result).toBe('- [ ] Task 1');
        });

        it('should preserve task text', () => {
            const content = '- [ ] Complex task with **bold** and `code`';
            const result = toggleCheckboxInContent(content, 1, true);

            expect(result).toBe('- [x] Complex task with **bold** and `code`');
        });
    });
});

describe('processChecklists', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'preview-content';
    });

    const createChecklistItem = (checked: boolean) => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;
        input.disabled = true; // Initially disabled
        li.appendChild(input);
        li.appendChild(document.createTextNode(' Task'));
        return li;
    };

    describe('checkbox enabling', () => {
        it('should enable checkboxes', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            processChecklists(container, vi.fn());

            expect(checkbox.disabled).toBe(false);
        });
    });

    describe('styling', () => {
        it('should add cursor-pointer class', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            processChecklists(container, vi.fn());

            expect(checkbox.classList.contains('cursor-pointer')).toBe(true);
        });

        it('should add styling classes', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            processChecklists(container, vi.fn());

            expect(checkbox.classList.contains('rounded')).toBe(true);
        });
    });

    describe('checked state visual', () => {
        it('should add line-through for checked items', () => {
            const li = createChecklistItem(true);
            container.appendChild(li);

            processChecklists(container, vi.fn());

            expect(li.classList.contains('line-through')).toBe(true);
        });

        it('should not add line-through for unchecked items', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);

            processChecklists(container, vi.fn());

            expect(li.classList.contains('line-through')).toBe(false);
        });
    });

    describe('processing state', () => {
        it('should add checklist-processed class', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            processChecklists(container, vi.fn());

            expect(checkbox.classList.contains('checklist-processed')).toBe(true);
        });

        it('should not reprocess already processed checkboxes', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
            checkbox.classList.add('checklist-processed');

            const onToggle = vi.fn();
            processChecklists(container, onToggle);

            // Should still be disabled since it was already processed
            // and we skipped it
            expect(checkbox.disabled).toBe(true);
        });
    });

    describe('change handler', () => {
        it('should call onToggle when checkbox is changed', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            const onToggle = vi.fn();
            processChecklists(container, onToggle);

            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));

            expect(onToggle).toHaveBeenCalled();
        });

        it('should pass checked state to onToggle', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            const onToggle = vi.fn();
            processChecklists(container, onToggle);

            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));

            expect(onToggle).toHaveBeenCalledWith(expect.any(Number), true);
        });

        it('should update visual state on change', () => {
            const li = createChecklistItem(false);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            processChecklists(container, vi.fn());

            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));

            expect(li.classList.contains('line-through')).toBe(true);
        });

        it('should remove visual state on uncheck', () => {
            const li = createChecklistItem(true);
            container.appendChild(li);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            processChecklists(container, vi.fn());

            // Initially has line-through
            expect(li.classList.contains('line-through')).toBe(true);

            // Uncheck
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));

            expect(li.classList.contains('line-through')).toBe(false);
        });
    });
});
