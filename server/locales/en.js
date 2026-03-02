// @ts-check

export default {
  translation: {
    firstName: 'Firstname',
    lastName: 'Lastname',
    password: 'Password',
    email: 'Email',
    appName: 'Task manager',
    flash: {
      session: {
        create: {
          success: 'You are logged in',
          error: 'Wrong email or password',
        },
        delete: {
          success: 'You are logged out',
        },
      },
      users: {
        notAllowed: 'You cant edit another user',
        update: {
          success: 'User changed',
          error: 'updating error',
        },
        create: {
          error: 'Failed to register',
          success: 'User registered successfully',
        },
      },
      authError: 'Access denied! Please login',
    },
    layouts: {
      application: {
        users: 'Users',
        signIn: 'Login',
        signUp: 'Register',
        signOut: 'Logout',
        statuses: 'Statuses',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Login',
          submit: 'Login',
        },
      },
      users: {
        actions: 'actions',
        fullName: 'full name',
        id: 'ID',
        email: 'Email',
        createdAt: 'Created at',
        new: {
          submit: 'Register',
          signUp: 'Register',
        },
        edit: {
          submit: 'change',
          title: 'changing user',
        },
      },
      welcome: {
        index: {
          hello: 'Hello from Hexlet!',
          description: 'Online programming school',
          more: 'Learn more',
        },
      },
      statuses: {
        new: {
          created_status: 'Created new status',
          submit: 'Create',
          name: 'Name',
        },
        id: 'ID',
        header: 'Statuses',
        name: 'Status name',
        createdAt: 'Created at',
      },
    },
  },
};
