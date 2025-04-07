// import { Twilio } from 'twilio';
import { env_constants } from './constanst';

// const { twilioAccountSID, twilioAuthToken, twilioPhoneNumber } = constants;
// const client = new Twilio(twilioAccountSID, twilioAuthToken);

const { SMSAccountSID, SMSAuthToken } = env_constants;

export const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    // const smsResponse = await client.messages.create({
    //   from: twilioPhoneNumber,
    //   to: phoneNumber,
    //   body: message,
    // });
    console.log(message);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};
