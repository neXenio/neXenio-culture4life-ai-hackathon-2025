// This file contains legacy features
// We're using a mock DataService for testing
interface DataService {
  getUser(id: string): Promise<any>;
  authenticateUser(credential: string, password: string): Promise<any>;
  updateUser(userId: string, fields: Record<string, any>): Promise<any>;
  deleteUser(userId: string): Promise<any>;
}

// Class for managing user accounts
class UserManager {
  private dataService: DataService;
  
  // Constructor for UserManager
  constructor(dataService: DataService) {
    // Initialize dataService
    this.dataService = dataService;
  }
  
  // Gets a user by ID
  // Returns the user object
  async getUserById(id: string) {
    // Call the data service to get user
    return this.dataService.getUser(id);
  }
  
  // This function was updated in v2.0
  // It now handles both email and username login
  async authenticateUser(credential: string, password: string) {
    // Check if credential is email or username
    const isEmail = credential.includes('@');
    
    // Get user by either email or username
    return this.dataService.authenticateUser(credential, password);
  }
  
  // Updates user profile
  // The fields parameter is an object with the fields to update
  updateUserProfile(userId: string, fields: Record<string, any>) {
    // Update user profile
    return this.dataService.updateUser(userId, fields);
  }
  
  // Deletes a user account
  // This is a permanent action and cannot be undone
  deleteUser(userId: string) {
    // This function deletes the user
    return this.dataService.deleteUser(userId);
  }
}

// Export the UserManager class
export default UserManager; 