const NAMES = [
    "آرش", "Arash", "کوروش", "Kourosh", "سیاوش", "Siavash", "بابک", "Babak", "داریوش", "Dariush", 
    "سامان", "Saman", "کامیار", "Kamyar", "پرهام", "Parham", "نیما", "Nima", "ارسلان", "Arsalan", 
    "سارا", "Sara", "نیکی", "Niki", "رویا", "Roya", "مهسا", "Mahsa", "آیدا", "Ayda", 
    "تینا", "Tina", "نگار", "Negar", "غزل", "Ghazal", "پریسا", "Parisa", "هدیه", "Hediye", 
    "امیر", "Amir", "رضا", "Reza", "محمد", "Mohammad", "حمید", "Hamid", "سعید", "Saeed", 
    "وحید", "Vahid", "مهدی", "Mehdi", "علی", "Ali", "حسین", "Hossein", "جواد", "Javad", 
    "آروین", "Arvin", "سپهر", "Sepehr", "مانی", "Mani", "رادین", "Radin", "بردیا", "Bardia", 
    "کیان", "Kian", "آرتین", "Artin", "رایان", "Rayan", "هومن", "Hooman", "نسترن", "Nastaran", 
    "شادی", "Shadi", "الناز", "Elnaz", "بهناز", "Behnaz", "طناز", "Tannaz", "یلدا", "Yalda", 
    "ساغر", "Saghar", "ترانه", "Taraneh", "مریم", "Maryam", "Salar", "Sina", "Yasamin", 
    "Behnam", "Farzad", "Omid", "Shayan", "Kaveh", "Pooya", "Sahand", "Melika", "Dorsa",
    "فرهاد", "Farhad", "نازنین", "Nazanin", "شیوا", "Shiva", "رامین", "Ramin", "شهاب", "Shahab",
    "Pouya", "Erfan", "Mobina", "Arian", "Soren", "Elya", "Atusa", "Donya", "Setareh", "Tala"
];

export function generateGenericName() {
    return `user${Math.floor(1000 + Math.random() * 90000)}`;
}

export function generateNames() {
    const list = [...NAMES];
    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}