import cover from '../../../src/assets/images/brand-reference-hero.jpg';
import type { CaseStudy, Contact, Service } from '../../../src/types/content';

// Only the isolated component root imports this file. Never production content.
export const fixtureMarker = 'COMPONENT_FIXTURE_ONLY';
export const contacts: Contact[] = [
  { kind: 'email', label: 'studio@example.com', href: 'mailto:studio@example.com' },
  { kind: 'phone', label: '+7 000 000-00-00', href: 'tel:+70000000000' },
  { kind: 'messenger', label: 'Тестовый мессенджер', href: 'https://example.com/contact' },
];
export const cases: CaseStudy[] = Array.from({ length: 3 }, (_, i) => ({
  id: `fixture-${i}`,
  title: [
    'Тестовая конференция',
    'Очень длинное название демонстрационного мероприятия',
    'Демонстрационный телемост',
  ][i],
  eventType: 'ТЕСТОВЫЕ ДАННЫЕ',
  cover,
  coverAlt: 'Демонстрационное изображение из айдентики',
  task: 'Проверка переноса длинного текста и заполненного состояния карточки.',
  solution: 'Иллюстративная запись для локального стенда компонентов.',
  result: 'Карточка проверена на разных ширинах.',
  order: i,
  published: false,
}));
export const services: Service[] = [
  {
    id: 'fixture-service',
    title: 'Тестовое направление',
    description:
      'Проверка длинного описания, которое должно свободно переноситься на узких экранах.',
    tag: 'TEST',
    order: 1,
    published: false,
  },
];
