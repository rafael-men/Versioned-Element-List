export interface PublicUser {
  id: string;
  email: string;
  createdAt: Date;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
}
