import * as yup from 'yup';

export const profileSchema = yup.object().shape({
  nickname: yup
    .string()
    // TODO: 글자제한 & 문구에 맞추어서 하기 (한글 8, 영문 16)
    .max(8, '8자 제한입니다.')
    .required('닉네임을 입력해주세요.')
    .matches(/^[^\s]+$/, '공백 불가')
    .matches(/^[^`~!@#$%^&*|]+$/, '특수문자 불가'),
  introduction: yup.string().max(50, '50자 제한입니다.').required('소개를 입력해주세요.'),
});
