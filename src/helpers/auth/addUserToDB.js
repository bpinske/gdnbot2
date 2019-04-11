const logger = require('../logger');
const { axiosGDN, GDN_URLS } = require('../axiosGDN');

/**
 * Insert the authed user into the GDN database
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} member - The Discord Member that completed authentication
 * @param {string} saID - The Member's SomethingAwful ID
 * @param {string} saUsername - The Member's SomethingAwful username
 */
const addUserToDB = async ({ tag, member, saID, saUsername }) => {
  try {
    const payload = {
      discord_id: member.id,
      sa_id: saID,
      sa_username: saUsername.substr(0, 19)
    };

    logger.info(tag, `Inserting member into database: ${JSON.stringify(payload)}`);

    await axiosGDN.post(GDN_URLS.MEMBERS, payload);
    logger.info(tag, 'Successfully inserted member');
  } catch (err) {
    logger.error({ ...tag, err }, 'Error inserting user');
  }
};

module.exports = addUserToDB;
