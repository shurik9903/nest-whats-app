import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import mongoose from 'mongoose';

@Schema({
  _id: false,
})
class OTP {
  @Prop()
  code: string;

  @Prop({ type: Date, default: () => dayjs().toDate() })
  createdAt?: Date;

  @Prop({ type: Date, default: () => dayjs().add(1, 'minute').toDate() })
  repeatAt?: Date;

  @Prop({ type: Date, default: () => dayjs().add(10, 'minute').toDate() })
  expiresAt?: Date;
}

@Schema()
export class User {
  _id?: mongoose.Types.ObjectId | string;

  @Prop({ required: false, maxlength: 100 })
  username?: string;

  @Prop({ required: false })
  profilePic?: string;

  @Prop({ required: false, default: false })
  isOnline?: boolean;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: false, default: [] })
  groupId?: string[];

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({ required: false, default: false })
  isPhoneVerified?: boolean;

  @Prop({ type: Date, default: () => dayjs().toDate() })
  createdAt?: Date;

  @Prop()
  otp?: OTP;
}

export const UserSchema = SchemaFactory.createForClass(User);
