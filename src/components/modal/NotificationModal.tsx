import Modal from 'react-modal';

const customStyles: Modal.Styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

interface NotificationModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  okTitle: string;
  cancelTitle: string;
  onOk: () => void;
  onClose: () => void;
}

export const NotificationModal = ({ isOpen, onClose, title, content, okTitle, cancelTitle, onOk }: NotificationModalProps) => {
  return (
    <Modal style={customStyles} isOpen={isOpen} ariaHideApp={false}>
      <h1 className="text-center font-bold text-xl mb-3 text-[#FDFDFD]">{title}</h1>
      <p className="text-center font-normal text-sm whitespace-pre mb-9 text-[#969696]">{content}</p>
      <button onClick={onClose} type="button" className="text-[#FDFDFD] text-center font-bold text-sm px-7 py-3 bg-[#2F2F2F] rounded mr-3 w-[166px]">
        {cancelTitle}
      </button>
      <button type="button" onClick={onOk} className="text-[#FDFDFD] text-center font-bold text-sm px-7 py-3 bg-[#2F2F2F] rounded w-[166px] bg-[#AE001F]">
        {okTitle}
      </button>
    </Modal>
  );
};
