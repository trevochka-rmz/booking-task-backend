import mongoose from 'mongoose';
import Location from './models/Location.js';
import dotenv from 'dotenv';

dotenv.config();

const seedLocations = async () => {
    const testLocations = [
        // Швейцария
        {
            name: 'Adventure Room',
            country: 'Швейцария',
            city: 'Цюрих',
            address: 'Bahnhofstrasse 1, 8001 Zürich',
            description: 'Лучшие квесты в центре Цюриха',
            price: 2500,
            capacity: 6,
            franchiseEmail: 'zurich@adventure.com',
            workingHours: [
                { day: 0, from: 12, to: 20 }, // Воскресенье
                { day: 1, from: 10, to: 22 }, // Понедельник
                { day: 2, from: 10, to: 22 }, // Вторник
                { day: 3, from: 10, to: 22 }, // Среда
                { day: 4, from: 10, to: 22 }, // Четверг
                { day: 5, from: 10, to: 23 }, // Пятница
                { day: 6, from: 10, to: 23 }, // Суббота
            ],
            games: [
                {
                    id: 'quiz1',
                    name: 'QUIZ Pixel',
                    description: 'Технологический квест о цифровом мире',
                    duration: 60,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
                {
                    id: 'quiz2',
                    name: 'QUIZ Каракас',
                    description: 'Приключенческий квест в джунглях',
                    duration: 90,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
            ],
            isActive: true,
        },
        {
            name: 'Brain Box',
            country: 'Швейцария',
            city: 'Женева',
            address: 'Rue du Mont-Blanc 5, 1201 Genève',
            description: 'Интеллектуальные квесты для эрудитов',
            price: 3000,
            capacity: 6,
            franchiseEmail: 'geneva@brainbox.com',
            workingHours: [
                { day: 0, from: 14, to: 20 },
                { day: 1, from: 12, to: 22 },
                { day: 2, from: 12, to: 22 },
                { day: 3, from: 12, to: 22 },
                { day: 4, from: 12, to: 22 },
                { day: 5, from: 12, to: 23 },
                { day: 6, from: 12, to: 23 },
            ],
            games: [
                {
                    id: 'quiz3',
                    name: 'Brain Storm',
                    description: 'Научный квест с головоломками',
                    duration: 75,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
            ],
            isActive: true,
        },

        // Франция
        {
            name: 'Escape Paris',
            country: 'Франция',
            city: 'Париж',
            address: '15 Rue de Rivoli, 75004 Paris',
            description: 'Квесты в историческом центре Парижа',
            price: 2800,
            capacity: 6,
            franchiseEmail: 'paris@escape.com',
            workingHours: [
                { day: 0, from: 11, to: 21 },
                { day: 1, from: 10, to: 22 },
                { day: 2, from: 10, to: 22 },
                { day: 3, from: 10, to: 22 },
                { day: 4, from: 10, to: 22 },
                { day: 5, from: 10, to: 23 },
                { day: 6, from: 10, to: 23 },
            ],
            games: [
                {
                    id: 'quiz4',
                    name: 'Paris Mystery',
                    description: 'Детектив в стиле парижской старины',
                    duration: 60,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
                {
                    id: 'quiz5',
                    name: 'Louvre Adventure',
                    description: 'Приключение в мире искусства',
                    duration: 90,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
            ],
            isActive: true,
        },

        // Испания
        {
            name: 'Barcelona Quest',
            country: 'Испания',
            city: 'Барселона',
            address: 'La Rambla, 101, 08002 Barcelona',
            description: 'Квесты с испанским колоритом',
            price: 2200,
            capacity: 6,
            franchiseEmail: 'barcelona@quest.com',
            workingHours: [
                { day: 0, from: 10, to: 22 },
                { day: 1, from: 10, to: 22 },
                { day: 2, from: 10, to: 22 },
                { day: 3, from: 10, to: 22 },
                { day: 4, from: 10, to: 22 },
                { day: 5, from: 10, to: 24 },
                { day: 6, from: 10, to: 24 },
            ],
            games: [
                {
                    id: 'quiz6',
                    name: 'Gaudi Challenge',
                    description: 'Квест по мотивам архитектуры Гауди',
                    duration: 75,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
            ],
            isActive: true,
        },

        // Турция
        {
            name: 'Istanbul Escape',
            country: 'Турция',
            city: 'Стамбул',
            address: 'Istiklal Cd. No:24, 34433 Istanbul',
            description: 'Квесты на стыке Европы и Азии',
            price: 1800,
            capacity: 6,
            franchiseEmail: 'istanbul@escape.com',
            workingHours: [
                { day: 0, from: 10, to: 22 },
                { day: 1, from: 10, to: 22 },
                { day: 2, from: 10, to: 22 },
                { day: 3, from: 10, to: 22 },
                { day: 4, from: 10, to: 22 },
                { day: 5, from: 10, to: 23 },
                { day: 6, from: 10, to: 23 },
            ],
            games: [
                {
                    id: 'quiz7',
                    name: 'Ottoman Secrets',
                    description: 'Исторический квест об Османской империи',
                    duration: 80,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
                {
                    id: 'quiz8',
                    name: 'Bosphorus Puzzle',
                    description: 'Головоломки на берегах Босфора',
                    duration: 60,
                    minPlayers: 2,
                    maxPlayers: 6,
                    languages: ['ru', 'en', 'ge'],
                },
            ],
            isActive: true,
        },
    ];

    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');

        // Очистка старых данных
        await Location.deleteMany({});
        console.log('Old locations deleted');

        // Добавление новых данных
        await Location.insertMany(testLocations);
        console.log(`${testLocations.length} locations added successfully`);

        // Вывод списка добавленных локаций
        const countries = [...new Set(testLocations.map((l) => l.country))];
        console.log('\nAdded countries:', countries.join(', '));

        testLocations.forEach((loc) => {
            console.log(`\n${loc.name} (${loc.city}, ${loc.country})`);
            console.log(`Games: ${loc.games.map((g) => g.name).join(', ')}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedLocations();
