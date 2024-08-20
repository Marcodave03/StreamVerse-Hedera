const users = [
  { email: 'user1@example.com', password: 'password1', hederaAccountId: 'unique_id_1' },
  { email: 'user2@example.com', password: 'password2', hederaAccountId: 'unique_id_2' },
  { email: 'user3@example.com', password: 'password3', hederaAccountId: 'unique_id_3' },
  { email: 'user4@example.com', password: 'password4', hederaAccountId: 'unique_id_4' },
  { email: 'user5@example.com', password: 'password5', hederaAccountId: 'unique_id_5' }
];

const profiles = [
  { user_id: 1, full_name: 'User One', bio: 'This is user one', gender: 'Male', date_of_birth: new Date('1990-01-01') },
  { user_id: 2, full_name: 'User Two', bio: 'This is user two', gender: 'Female', date_of_birth: new Date('1992-02-02') },
  { user_id: 3, full_name: 'User Three', bio: 'This is user three', gender: 'Male', date_of_birth: new Date('1993-03-03') },
  { user_id: 4, full_name: 'User Four', bio: 'This is user four', gender: 'Female', date_of_birth: new Date('1994-04-04') },
  { user_id: 5, full_name: 'User Five', bio: 'This is user five', gender: 'Male', date_of_birth: new Date('1995-05-05') }
];

export async function up(queryInterface) {
  await queryInterface.bulkDelete('Users', null, {});
  await queryInterface.bulkDelete('Profiles', null, {});

  await queryInterface.bulkInsert('Users', users, {});
  await queryInterface.bulkInsert('Profiles', profiles, {});
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('Profiles', null, {});
  await queryInterface.bulkDelete('Users', null, {});
}
