import { UserRepository } from '../repositories/userRepository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getOrCreateUser(uid: string, email: string) {
    let user = await this.userRepository.findByUid(uid);
    if (!user) {
      user = await this.userRepository.create(uid, email);
    }
    return user;
  }
}
