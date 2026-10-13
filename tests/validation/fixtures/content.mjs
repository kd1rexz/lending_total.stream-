// Synthetic data for isolated validator tests only. Never imported by src/.
export const fixtureImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1cAAAAASUVORK5CYII=',
  'base64',
);

export function approvedSource() {
  return {
    site: {
      name: 'Изолированный fixture',
      description: 'Тестовый набор для проверки разрешённой сборки.',
      contacts: [
        { kind: 'phone', label: 'Тестовый телефон', href: 'tel:+79991234567' },
        {
          kind: 'email',
          label: 'Тестовая почта',
          href: 'mailto:fixture@total-stream-validation.ru',
        },
        {
          kind: 'messenger',
          label: 'Тестовый мессенджер',
          href: 'https://t.me/total_stream_validation_fixture',
        },
      ],
      contentApproved: true,
      brandApproved: true,
    },
    navigation: [{ label: 'Контакты', href: '#contacts' }],
    editorial: {
      process: [{ title: 'Тестовый этап', description: 'Описание этапа в fixture.' }],
      reliability: [{ title: 'Тестовая проверка', description: 'Описание проверки в fixture.' }],
      faq: [{ question: 'Тестовый вопрос?', answer: 'Тестовый ответ.' }],
      reviews: [],
      clients: [],
    },
    services: Array.from({ length: 3 }, (_, index) => ({
      id: `service-${index + 1}`,
      title: `Тестовая услуга ${index + 1}`,
      description: 'Изолированные данные теста.',
      tag: 'Fixture',
      order: index,
      published: true,
    })),
    cases: Array.from({ length: 3 }, (_, index) => ({
      id: `case-${index + 1}`,
      title: `Тестовый кейс ${index + 1}`,
      eventType: 'Fixture',
      cover: '../assets/images/fixture.png',
      coverAlt: 'Изолированный тестовый пиксель.',
      task: 'Тестовая задача.',
      solution: 'Тестовое решение.',
      result: 'Тестовый результат.',
      order: index,
      published: true,
    })),
    assets: {
      productionReady: true,
      items: [
        {
          path: 'src/assets/images/fixture.png',
          source: 'Generated test fixture in a temporary directory.',
          rights: 'cleared',
          status: 'approved',
          scope: 'production',
          note: 'Only verifies validator behavior; does not establish real-world rights.',
        },
      ],
    },
  };
}
