import Modal from 'react-modal';

const customStyles: Modal.Styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0000007f',
  },
  content: {
    width: 400,
    padding: '54px 27px 32px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1C1C1C',
    border: '1px solid #2F2F2F',
  },
};

interface INotificationModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  okTitle: string;
  cancelTitle: string;
  onOk: () => void;
  onClose: () => void;
}

export const NotificationModal = ({
  isOpen,
  onClose,
  title,
  content,
  okTitle,
  cancelTitle,
  onOk,
}: INotificationModalProps) => {
  return (
    <Modal style={customStyles} isOpen={isOpen} ariaHideApp={false}>
      <h1 className='text-center font-bold text-xl mb-3 text-[#FDFDFD]'>
        {/* title={'잠깐만요!'} */}
        {title}
      </h1>
      <p className='text-center font-normal text-sm whitespace-pre-line mb-9 text-[#969696]'>
        {content}

        {/* '비로그인 입장 시 접근 가능한 기능이 제한됩니다 구글 계정을 연동하면 온전한 서비스를 즐길 수 있어요' */}
      </p>
      <button
        onClick={onClose}
        type='button'
        className='text-[#FDFDFD] text-center font-bold text-sm px-7 py-3 bg-[#2F2F2F] rounded mr-3 w-[166px]'
      >
        {cancelTitle}
        {/* cancelTitle={'비로그인 입장하기'} */}
      </button>
      <button
        type='button'
        onClick={onOk}
        // signInGoogle
        className='text-[#FDFDFD] text-center font-bold text-sm px-7 py-3 rounded w-[166px] bg-gradient-to-r from-[#780808] to-[#AE001F]'
      >
        {okTitle}
        {/* okTitle={'구글 연동하기'} */}
      </button>
    </Modal>
  );
};
