const logger = require('../../logger');
const { axiosGDN, GDN_URLS } = require('../../axiosGDN');

const addUserToDB = async ({ tag, member, saID, saUsername }) => {
  logger.info(tag, 'Inserting member into database');

  const payload = {
    discord_id: member.id,
    sa_id: saID,
    sa_username: saUsername.substr(0, 19)
  };

  try {
    await axiosGDN.post(GDN_URLS.MEMBERS, payload);
    logger.info(tag, 'Successfully inserted member');
  } catch (err) {
    logger.error({ ...tag, err }, 'Error inserting user');
  }
};

module.exports = addUserToDB;
