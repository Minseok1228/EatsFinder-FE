import { useState } from 'react';
import { useTimer } from './useTimer';
import { EmailConfirmType } from '@/types/authType';
import { emailRegex } from '@/utils/zodSchema';
import {
  FieldValues,
  Path,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';
import { KOTLIN_SERVER } from '@/constants/baseUrl';
import { useToast } from '@/provider/contextProvider/ToastProvider';
import { debounce } from 'lodash';

export const useEmailConfirm = <
  T extends FieldValues & { codeValidation?: boolean },
>(
  setValue: UseFormSetValue<T>,
  trigger: UseFormTrigger<T>,
) => {
  const [authButtonState, setAuthButtonState] = useState(false);
  const { time, startTimer, formatTime, resetTimer } = useTimer(300);
  const { showToast } = useToast();
  const sendEmail = (email: string, { checkDuplicate = true } = {}) =>
    debounce(async () => {
      if (isValidEmail(email)) {
        if (checkDuplicate) {
          const response = await isDuplicateEmail(email);
          if (response.statusCode !== 'SUCCESS') {
            return showToast('이미 가입되어 있는 이메일 입니다.', 'error');
          }
        }

        const response = await sendCode(email);
        if (response.statusCode === 'SUCCESS') {
          showToast(response.message, 'success');
          setAuthButtonState(true);
          startTimer();
        } else {
          showToast('인증번호가 만료되지 않았습니다', 'error');
        }
      }
    }, 300);

  const confirmEmail = (data: EmailConfirmType) => async () => {
    const response = await confirmCode(data);
    if (response.statusCode === 'SUCCESS') {
      setValue('codeValidation' as Path<T>, true as any);
      trigger('codeValidation' as Path<T>);
      resetTimer();
      setAuthButtonState(false);
      showToast('이메일 인증완료', 'success');
    } else if (response.statusCode === 'ERROR') {
      setValue('codeValidation' as Path<T>, false as any);
      trigger('codeValidation' as Path<T>);
    }
    return response;
  };

  return { sendEmail, authButtonState, formatTime, time, confirmEmail };
};

const isDuplicateEmail = async (email: string) => {
  try {
    const response = await fetch(
      `${KOTLIN_SERVER}/auth/email/{provider}?email=${email}&provider=LOCAL`,
      {
        method: 'GET',
        headers: {
          accept: '*/*',
        },
      },
    );
    return response.json();
  } catch (error) {
    throw new Error('이메일 중복 검사 중 오류가 발생했습니다.');
  }
};
const sendCode = async (email: string) => {
  const response = await fetch(`${KOTLIN_SERVER}/auth/email`, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      email,
    }),
  });
  try {
    const res = await response.json();
    if (res.statusCode === 'SUCCESS') {
      return res;
    } else if (res.statusCode === 'ERROR') {
      return res;
    }
  } catch (error) {
    throw new Error('인증번호 발송 중 에러가 발생했습니다.');
  }
};
const confirmCode = async (data: EmailConfirmType) => {
  const { code, email } = data;
  const response = await fetch(
    `${KOTLIN_SERVER}/auth/email/verify-code?email=${email}&code=${code}`,
    {
      method: 'GET',
      headers: { accept: '*/*' },
    },
  );

  return response.json();
};
const isValidEmail = (email: string) => {
  return emailRegex.test(email);
};
