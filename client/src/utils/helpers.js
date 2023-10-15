import DOMPurify from 'dompurify';

/**
 * Truncates text after a specified number of newlines.
 * @param {String} text - Text to truncate.
 * @param {Number} lines - Number of lines to retain in the truncated text.
 * @returns The truncated text.
 */
export const truncateText = (text, lines) => {
    if (!text) return '';
    let n = 0, i = 0;
    let length = text.length;
    for (i = 0; i < length; i++) {
        if (text[i] === '\n') {
            if (n++ >= lines - 1) {
                break;
            }
        }
    }
    return text.slice(0, i) + (length > i + 1 ? ' ...' : '');
}

/**
 * Formats a number into a more human-readable format with K (thousands) or M (millions) suffixes.
 * @param {Number} num - The number to format.
 * @returns The formatted number.
 */
export function numFormatter(num) {
    if (num >= 1000 && num < 1000000) {
        return (num / 1000).toFixed(2) + 'K'; // Convert to K for numbers between 1000 and 1 million.
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'; // Convert to M for numbers greater than 1 million.
    } else if (num < 1000) {
        return num; // If the value is less than 1000, no formatting is needed.
    }
}

/**
 * Sanitizes and validates input based on the specified type and options.
 * @param {String} input - Input to sanitize and validate.
 * @param {String} type - The input type, one of 'name', 'username', 'password', 'html', or 'custom'.
 * @param {Object} opts - Optional settings with the following signature: { min_length, max_length, regex, identifier }
 * @returns The sanitized and validated input, or throws an error with a message if validation fails.
 */
export function filterInput(input = '', type = 'custom', {
    min_length: min = 1,
    max_length: max = 70,
    regex: reg = null,
    identifier = null
} = {}) {
    identifier = identifier || `input {${type}}`;
    input = input.toString().trim();
    let regexes = {
        username: RegExp(`^[_a-zA-Z0-9]{${min},${max}}$`),
        password: RegExp(`^\\S{${min},${max}}$`),
        name: RegExp(`^.{${min},${max}}$`),
    };
    if (!reg) {
        reg = regexes[type];
    }
    if (reg) {
        if (!reg.test(input)) {
            throw Error(`${identifier} must match regex: ${reg} (range between ${min} and ${max} characters)`);
        }
    }
    // Handle 'html' or custom types
    if (type === 'html') {
        input = DOMPurify.sanitize(input, { ALLOWED_TAGS: ['b'] }).trim();
    }
    if (input.length > max || input.length < min) {
        throw Error(`${identifier} must be a minimum of ${min} and a maximum of ${max} characters`);
    }
    if (input.includes('\n')) {
        // Handle long text by stripping multiple newlines.
        input = input.replace(/\n+/g, '\n').trim();
    }
    return input;
}
