import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import CommonModal from '../../components/CommonModal';
import SelectTokenList from './SelectTokenList';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';
import './styles.less';
import { Carousel } from 'antd';
import { CarouselRef } from 'antd/lib/carousel';
import { useRef, useState } from 'react';
import ManageTokens from 'Modals/SelectTokenModal/ManageTokens';
import CommonModalHeader from 'components/CommonModalHeader';
export default function SelectTokenModal() {
  const { t } = useTranslation();
  const [{ selectTokenModal }, { dispatch }] = useModal();
  const isMobile = useMobile();
  const corousel = useRef<CarouselRef>(null);
  const [slide, setSlide] = useState(0);

  const onCloseModal = () => {
    setSlide(0);
    dispatch(basicModalView.setSelectTokenModal.actions(false));
  };

  const onBack = () => {
    setSlide(0);
    corousel.current?.goTo(0);
  };

  return (
    <CommonModal
      width="420px"
      height={isMobile ? 'auto' : '632px'}
      visible={selectTokenModal}
      title={false}
      onCancel={() => {
        if (slide === 1) {
          onBack();
        } else {
          onCloseModal();
        }
      }}
      className={isMobile ? 'select-token-modal-m' : 'select-token-modal'}
      closable={slide !== 1}
      showBackIcon={slide === 1}>
      <Carousel ref={corousel} slickGoTo={slide} dots={false} autoplay={false} swipe={false}>
        <div className="modal-panel">
          <div className="modal-panel-content">
            <CommonModalHeader title={t('selectAToken')} showClose={true} onClose={onCloseModal} />
            <SelectTokenList
              onClickManageTokens={() => {
                setSlide(1);
                corousel.current?.goTo(1);
              }}
            />
          </div>
        </div>
        <div className="modal-panel">
          <div className="modal-panel-content">
            <CommonModalHeader title={t('tokenLists')} showBack={true} onBack={onBack} />
            <ManageTokens />
          </div>
        </div>
      </Carousel>
    </CommonModal>
  );
}
