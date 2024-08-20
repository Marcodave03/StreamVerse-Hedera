import bcrypt from "bcrypt";

const saltRounds = 10;

async function hashPasswords(users) {
  return Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      return { ...user, password: hashedPassword };
    })
  );
}

const users = [
  {
    id: 1,
    email: "user1@example.com",
    password: "222",
    hederaAccountId: "0.0.4688212",
  },
  {
    id: 2,
    email: "user2@example.com",
    password: "222",
    hederaAccountId: "0.0.4688214",
  },
  {
    id: 3,
    email: "user3@example.com",
    password: "222",
    hederaAccountId: "0.0.4690145",
  },
  {
    id: 4,
    email: "user4@example.com",
    password: "222",
    hederaAccountId: "0.0.4690150",
  },
  {
    id: 5,
    email: "user5@example.com",
    password: "222",
    hederaAccountId: "0.0.4690152",
  },
  {
    id: 6,
    email: "user6@example.com",
    password: "222",
    hederaAccountId: "0.0.4699806",
  },
  // {
  //   email: "user7@example.com",
  //   password: "password7",
  //   hederaAccountId: "unique_id_7",
  // },
  // {
  //   email: "user8@example.com",
  //   password: "password8",
  //   hederaAccountId: "unique_id_8",
  // },
  // {
  //   email: "user9@example.com",
  //   password: "password9",
  //   hederaAccountId: "unique_id_9",
  // },
  // {
  //   email: "user10@example.com",
  //   password: "password10",
  //   hederaAccountId: "unique_id_10",
  // },
  // {
  //   email: "user11@example.com",
  //   password: "password11",
  //   hederaAccountId: "unique_id_11",
  // },
  // {
  //   email: "user12@example.com",
  //   password: "password12",
  //   hederaAccountId: "unique_id_12",
  // },
  // {
  //   email: "user13@example.com",
  //   password: "password13",
  //   hederaAccountId: "unique_id_13",
  // },
  // {
  //   email: "user14@example.com",
  //   password: "password14",
  //   hederaAccountId: "unique_id_14",
  // },
  // {
  //   email: "user15@example.com",
  //   password: "password15",
  //   hederaAccountId: "unique_id_15",
  // },
];

const profiles = [
  {
    id: 1,
    user_id: 1,
    full_name: "Dillon Wongso",
    bio: "Hey there! I am using Hedera. This is dillon wongso",
    gender: "Male",
    date_of_birth: new Date("1990-01-01"),
  },
  {
    id: 2,
    user_id: 2,
    full_name: "Eric Tianto",
    bio: "Hey there! I am using Hedera. This is eric tianto",
    gender: "Female",
    date_of_birth: new Date("1992-02-02"),
  },
  {
    id: 3,
    user_id: 3,
    full_name: "Albert Leonardi",
    bio: "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
    gender: "Male",
    date_of_birth: new Date("1993-03-03"),
  },
  {
    id: 4,
    user_id: 4,
    full_name: "Kai Cenat",
    bio: "Kai cenat fanum taxus. This is kai cenat",
    gender: "Male",
    date_of_birth: new Date("1994-04-04"),
  },
  {
    id: 5,
    user_id: 5,
    full_name: "Macie Jay",
    bio: "Pro rainbow six siege player. This is macie, welcome to my channel, don't forget to like and subscribe",
    gender: "Male",
    date_of_birth: new Date("1995-05-05"),
  },
  {
    id: 6,
    user_id: 6,
    full_name: "Marco Dave",
    bio: " I’m currently Computer Science Student 👯 I’m looking to collaborate on Web3 or Mobile Projects! 🤝 Looking for a Teams 🌱 Currently learning JavaScript 💬 Reach me out ⚡ Goals : Do more project & competition",
    gender: "Male",
    date_of_birth: new Date("1995-05-05"),
  },
  // {
  //   user_id: 7,
  //   full_name: "kayb",
  //   bio: "trying my best w/ 100 frames // !trip !factor #factor75partner",
  //   gender: "Female",
  //   date_of_birth: new Date("1995-05-05"),
  // },
  // {
  //   user_id: 8,
  //   full_name: "jynxzi",
  //   bio: "🏆This is a watch party channel for Jynxzi🏆 I have permission from Junko to promote him in this waiting room",
  //   gender: "Male",
  //   date_of_birth: new Date("1995-05-05"),
  // },
  // {
  //   user_id: 9,
  //   full_name: "Shroud",
  //   bio: "Former pro-CS:GO player turned streamer. Watch me dominate in various FPS games.",
  //   gender: "Male",
  //   date_of_birth: new Date("1994-06-02"),
  // },
  // {
  //   user_id: 10,
  //   full_name: "Pokimane",
  //   bio: "Variety streamer with a focus on gaming, IRL streams, and just chatting. Join the fun!",
  //   gender: "Female",
  //   date_of_birth: new Date("1996-05-14"),
  // },
  // {
  //   user_id: 11,
  //   full_name: "DrLupo",
  //   bio: "Gaming streamer and charity advocate. Join me for gameplay and charity streams.",
  //   gender: "Male",
  //   date_of_birth: new Date("1987-03-20"),
  // },
  // {
  //   user_id: 12,
  //   full_name: "Ninja",
  //   bio: "Professional gamer and streamer, known for Fortnite and high-energy streams.",
  //   gender: "Male",
  //   date_of_birth: new Date("1991-06-05"),
  // },
  // {
  //   user_id: 13,
  //   full_name: "Valkyrae",
  //   bio: "Streaming and gaming influencer. Co-owner of 100 Thieves, streaming a variety of games.",
  //   gender: "Female",
  //   date_of_birth: new Date("1992-01-08"),
  // },
  // {
  //   user_id: 14,
  //   full_name: "Summit1g",
  //   bio: "FPS streamer with a love for competitive gaming and engaging with my community.",
  //   gender: "Male",
  //   date_of_birth: new Date("1987-04-23"),
  // },
  // {
  //   user_id: 15,
  //   full_name: "Lirik",
  //   bio: "Variety streamer known for exploring new games and entertaining live commentary. Welcome!",
  //   gender: "Male",
  //   date_of_birth: new Date("1990-10-29"),
  // },
];

const streams = [
  {
    user_id: 1,
    title: "Fun time with friends",
    thumbnail: "https://i.ibb.co.com/xSCXRmR/image.png",
    stream_url: "0.0.4688213",
    is_live: 0,
    topic_id: "0.0.4688213",
  },
  {
    user_id: 2,
    title: "Dota 2 Rampage",
    thumbnail: "https://i.ibb.co.com/f99v69V/image.png",
    stream_url: "0.0.4688215",
    is_live: 0,
    topic_id: "0.0.4688215",
  },
  {
    user_id: 3,
    title: "I'm Diamond 1",
    thumbnail: "https://i.ibb.co.com/zmkpQzW/image.png",
    stream_url: "0.0.4690146",
    is_live: 0,
    topic_id: "0.0.4690146",
  },
  {
    user_id: 4,
    title:
      "🍄KAI X SPEED MINECRAFT HARDCORE🍄MARATHON🍄ELITE GAMING🍄BEST GAMER🍄DAY 4🍄BIGGEST DWARF🍄",
    thumbnail: null,
    stream_url: "0.0.4690151",
    is_live: 0,
    topic_id: "0.0.4690151",
  },
  {
    user_id: 5,
    title: "🏆Destroying coppers is fun🏆",
    thumbnail: "https://i.ibb.co.com/fpYCwv6/image.png",
    stream_url: "0.0.4690153",
    is_live: 0,
    topic_id: "0.0.4690153",
  },
  {
    user_id: 6,
    title: "🌱Web3 Project Collaboration🌱",
    thumbnail: null,
    stream_url: "0.0.4699807",
    is_live: 0,
    topic_id: "0.0.4699807",
  },
];

export async function up(queryInterface) {
  await queryInterface.bulkDelete("Users", null, {});
  await queryInterface.bulkDelete("Profiles", null, {});
  await queryInterface.bulkDelete("Streams", null, {});

  const hashedUsers = await hashPasswords(users);

  await queryInterface.bulkInsert("Users", hashedUsers, {});
  await queryInterface.bulkInsert("Profiles", profiles, {});
  await queryInterface.bulkInsert("Streams", streams, {});
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("Profiles", null, {});
  await queryInterface.bulkDelete("Users", null, {});
  await queryInterface.bulkDelete("Streams", null, {});
}
