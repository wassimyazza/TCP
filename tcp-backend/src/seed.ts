import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { TextsService } from './texts/texts.service';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const textsService = app.get(TextsService);

  const existing = await usersService.findByEmail('admin@tcp.com');
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await usersService.create({
      username: 'admin',
      email: 'admin@tcp.com',
      password: hashed,
      role: 'admin',
    });
    console.log('Admin created: admin@tcp.com / admin123');
  } else {
    console.log('Admin already exists');
  }

  const texts = await textsService.findAll();
  if (texts.length < 10) {
    const sampleTexts = [
      {
        content:
          'The quick brown fox jumps over the lazy dog near the river bank on a sunny afternoon.',
        language: 'en',
        difficulty: 'easy',
      },
      {
        content:
          'She sells seashells by the seashore and the shells she sells are surely seashells.',
        language: 'en',
        difficulty: 'easy',
      },
      {
        content:
          'A journey of a thousand miles begins with a single step taken with courage and faith.',
        language: 'en',
        difficulty: 'easy',
      },
      {
        content:
          'The sun rises in the east and sets in the west painting the sky with beautiful colors.',
        language: 'en',
        difficulty: 'easy',
      },
      {
        content:
          'Birds sing in the morning trees and the wind carries their melodies across the fields.',
        language: 'en',
        difficulty: 'easy',
      },
      {
        content:
          'Programming is the art of telling another human what one wants the computer to do precisely.',
        language: 'en',
        difficulty: 'medium',
      },
      {
        content:
          'The best way to predict the future is to invent it using creativity and hard work every day.',
        language: 'en',
        difficulty: 'medium',
      },
      {
        content:
          'Software development requires both logical thinking and creative problem solving skills daily.',
        language: 'en',
        difficulty: 'medium',
      },
      {
        content:
          'Clean code always looks like it was written by someone who cares deeply about their craft.',
        language: 'en',
        difficulty: 'medium',
      },
      {
        content:
          'Every great developer you know got there by solving problems they were not qualified to solve.',
        language: 'en',
        difficulty: 'medium',
      },
      {
        content:
          'Artificial intelligence is transforming the way we interact with technology across all industries.',
        language: 'en',
        difficulty: 'hard',
      },
      {
        content:
          'Distributed systems require careful consideration of consistency availability and partition tolerance.',
        language: 'en',
        difficulty: 'hard',
      },
      {
        content:
          'The complexity of modern software architectures demands rigorous testing and continuous integration.',
        language: 'en',
        difficulty: 'hard',
      },
      {
        content:
          'Cryptographic algorithms protect sensitive data by transforming it into unreadable ciphertext formats.',
        language: 'en',
        difficulty: 'hard',
      },
      {
        content:
          'Machine learning models require large datasets to generalize well across unseen input distributions.',
        language: 'en',
        difficulty: 'hard',
      },
      {
        content:
          'Le soleil brille sur la ville et les enfants jouent dans le parc avec leurs amis.',
        language: 'fr',
        difficulty: 'easy',
      },
      {
        content:
          'Le chat noir dort sur le tapis rouge devant la cheminée chaude de la maison.',
        language: 'fr',
        difficulty: 'easy',
      },
      {
        content:
          'La pluie tombe doucement sur les toits de la ville pendant la nuit froide.',
        language: 'fr',
        difficulty: 'easy',
      },
      {
        content:
          'La programmation est une compétence essentielle dans le monde moderne et numérique actuel.',
        language: 'fr',
        difficulty: 'medium',
      },
      {
        content:
          'Les développeurs doivent comprendre les algorithmes et les structures de données pour réussir.',
        language: 'fr',
        difficulty: 'medium',
      },
      {
        content:
          'La technologie évolue rapidement et les professionnels doivent constamment mettre à jour leurs connaissances.',
        language: 'fr',
        difficulty: 'medium',
      },
      {
        content:
          'Les systèmes distribués nécessitent une architecture robuste pour garantir la haute disponibilité des services.',
        language: 'fr',
        difficulty: 'hard',
      },
      {
        content:
          'L intelligence artificielle révolutionne de nombreux secteurs industriels grâce aux algorithmes d apprentissage.',
        language: 'fr',
        difficulty: 'hard',
      },
    ];

    for (const t of sampleTexts) {
      await textsService.create(t as any);
    }
    console.log(`${sampleTexts.length} texts created`);
  } else {
    console.log('Texts already exist');
  }

  await app.close();
  console.log('Seed done');
}

seed();
