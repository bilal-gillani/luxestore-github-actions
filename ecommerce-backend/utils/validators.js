const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateRequired = (fields, body) => {
    const missing = fields.filter(f => !body[f] || String(body[f]).trim() === '');
    return missing;
};

const sanitizeString = (str, maxLength = 255) => {
    if (!str) return '';
    return String(str).trim().substring(0, maxLength);
};

const validatePositiveNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
};

const validateInteger = (value, min = 0) => {
    const num = parseInt(value);
    return !isNaN(num) && num >= min;
};

module.exports = {
    validateEmail,
    validatePassword,
    validateRequired,
    sanitizeString,
    validatePositiveNumber,
    validateInteger
};
