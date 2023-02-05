import { UserRole } from './schemas';

export interface UserPublic {
  id: string;

  username: string;

  email: string;

  roles: UserRole[];
}
