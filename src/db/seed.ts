import type { UserDoc } from './dexie';

export const SEED_USERS: UserDoc[] = [
  {
    id: 'u-admin-1',
    name: 'Gaia',
    role: 'Admin',
    email: 'gaia.bilardi25@gmail.com',
    password: 'admin123',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi9w5HxQXm6-b25Ttv31aUFZ-xjm9VynoTbQhXVD5w0P8pylUKwnBkQaaWWNPd-k5dhLLqJb4HAT08CA3GQK74ntZXfzG1pRSn72rM3g1EDdq-xPrFwvW4eK_KP7tNo-OS4oYfSd512ze1_b3EXen_tfrWf5PcV_-RT5LTOPBI-lE0WNJYjanI9tSvyBSD_UksJ54Y52VnBfWnf1qg6Ll5kDaVHyJOVae5TL067mIwJbFo9t8tGpHA',
  },
  {
    id: 'u-staff-1',
    name: 'Alessio',
    role: 'Staff',
    email: 'staff@caffetoninho.it',
    password: 'staff123',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5WfYZ-g4tLsqs6p-FERH6-Um_mme6d9DrwILOy51h4Z3psGf3Z1A3l4-oRfGh_mmrDrK9k8pgUGmgGinvk9K8uJHp_7yS8uB2UEmxLS0KVMgsz1EwTFZ2tGYMcez-Vo0an1eY-4SKEatP4Oi13ciwf7o9gGPGRd3_0HVHQVhb41Ii7FY53nq2L3VQkEI5Wy3TXq8ZkFpRrFjx7Z1J7UUpLbrxP6bj7DqtwsyAGsjq3jNHJP9fuwc2',
  },
];
