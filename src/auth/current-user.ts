export class CurrentUser {
  private static instance: CurrentUser;
  private readonly userId = 1;

  private constructor() {}

  public static getInstance(): CurrentUser {
    if (!CurrentUser.instance) {
      CurrentUser.instance = new CurrentUser();
    }
    return CurrentUser.instance;
  }

  public getId(): number {
    return this.userId;
  }
}
