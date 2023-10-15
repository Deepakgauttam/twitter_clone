/**
 * escapeHtml - Escapes HTML entities in a string to prevent XSS attacks.
 * @param {String} unsafe - The input string to sanitize.
 * @returns {String} - Sanitized input with HTML entities escaped.
 */
function escapeHtml(unsafe) {
    if (!unsafe || unsafe.length === 0) return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * filterInput - Sanitizes and validates input based on type and options.
 * @param {String} input - The input to sanitize.
 * @param {String} type - One of 'name', 'username', 'password', 'html', 'custom'.
 * @param {Object} opts - Optional settings including min_length, max_length, and regex.
 * @returns {String} - Sanitized and validated input.
 * @throws {Error} - If the input is invalid, an error with a user-friendly message is thrown.
 */
function filterInput(
    input = '',
    type = 'custom',
    { min_length: min = 1, max_length: max = 70, regex: reg = null, identifier = null } = {}
) {
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
            throw Error(
                `${identifier} must match regex: ${reg} (range between ${min} and ${max} characters)`
            );
        }
    }

    if (input.length > max || input.length < min) {
        throw Error(`${identifier} must be minimum ${min} and maximum ${max} characters`);
    }

    if (input.includes('\n')) {
        // If the input contains multiple newlines, remove extra newlines and trim.
        input = input.replace(/\n+/g, '\n').trim();
    }

    return input;
}

/**
 * getRandomProfileUrl - Generates a random profile image URL.
 * @returns {String} - Random profile image URL.
 */
function getRandomProfileUrl() {
    let imgs = [
        'animals-1298747.svg',
        'bunny-155674.svg',
        // ... (other image file names)
    ];
    let img = imgs[Math.floor(Math.random() * imgs.length)];
    return `/img/${img}`;
}

/**
 * ensureCorrectImage - Ensures that the provided image URL is valid. If not, it returns a random profile image URL.
 * @param {String} url - The image URL to check.
 * @returns {String} - A valid image URL.
 */
function ensureCorrectImage(url) {
    if (!url || !url.startsWith('/img')) {
        return getRandomProfileUrl();
    }
    return url;
}

// Export the functions for use in other modules.
exports.filterInput = filterInput;
exports.ensureCorrectImage = ensureCorrectImage;
exports.getRandomProfileUrl = getRandomProfileUrl;
