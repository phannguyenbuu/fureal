import React, { useState } from 'react';
import { Button, Modal, Input, Form } from 'antd';
import { useSelection } from "../stores/selectionStore";


const imgStyle = { width: 80 };

function PanelFurnituresModal({furnitures, title, icon}) {
  const { currentLibNodeSelection, setCurrentLibNodeSelection, setMessage } = useSelection();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isOrderModalVisible, setOrderModalVisible] = useState(false);

  const [form] = Form.useForm();
  const isCart = title === "GIỎ HÀNG";

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const openOrderModal = () => setOrderModalVisible(true);
  const closeOrderModal = () => setOrderModalVisible(false);

  const handleSelect = (btn) => {
    setMessage(`Đã chọn ${btn.name} ${toVN(btn.cost)}|Vui lòng đợi load file 3D`);
    setCurrentLibNodeSelection(btn);
    closeModal();
  };

  const totalCost = furnitures.reduce((sum, item) => {
    const quantity = item.quantity ?? 1;
    const costNum = typeof item.cost === 'number' ? item.cost : Number(item.cost);
    return sum + (costNum * quantity);
  }, 0);

  // Tạo tiêu đề hiển thị
  const modalTitle = isCart
    ? `${title} - Tổng giá trị: ${totalCost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
    : title;

  
  const handleOrder = () => {
    closeModal();
    openOrderModal();
  };

  const onFinishOrder = (values) => {
    form.resetFields();
    setMessage(`Đặt hàng thành công đơn hàng ${totalCost}\nKhách hàng: ${values.fullName}`);
    closeOrderModal();
  };

  return (
    <>
      {/* Icon hoặc nút mở modal */}
      <Button type="dashed" onClick={openModal} 
        style= {{width:120,height:120,whiteSpace:'nowrap', 
        display:'flex', flexDirection:'column'}}>
          <img src={icon} width={40} height={40}/>
          <p>{title}</p>
          {isCart && <p>{totalCost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>}
        </Button>

      {/* Modal chứa danh sách furnitures.bedroom */}
      <Modal
        title={modalTitle}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width='90vw'
        style={{overflowX:'hidden', overflowY:'auto'}}
      >
        <div style={{ display: "grid", gridTemplateColumns:'repeat(5, 1fr)',
           gap: 10, maxHeight: '60vh', overflowY: 'auto' }}>
          {furnitures.map((btn, index) => {
            const isSelected = currentLibNodeSelection?.name === btn.name;
            const q = btn.quatity ? btn.quantity : 1;

            return (
              <Button
                key={index}
                type={isSelected ? "primary" : "default"}
                style={{
                  height: 180,
                  display: "flex",
                  flexDirection:'column',
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "flex-start",
                  borderRadius: 5,
                  textAlign: "left",
                  padding: 2,
                  display:'flex',
                }}
                onClick={() => handleSelect(btn)}
              >
                <img src={btn.preview} alt={btn.name} style={imgStyle} />
                <p>{btn.name}
                  <span>(x){q}</span>
                </p>
                {btn.cost && 
                  <p>{btn.cost.toLocaleString('vi-VN', 
                    { style: 'currency', currency: 'VND' })}
                    {isCart &&
                  <span>(x){q}={(btn.cost * q).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>}
                </p>}
              </Button>
            );
          })}
          
        </div>
        
        {isCart &&
        <Button type="primary" style={{ marginTop: 20, width: 200, height: 60 }} onClick={handleOrder}>
            Đặt hàng ngay
        </Button>}

        
      </Modal>

      <Modal
        title="Thông tin đặt hàng"
        visible={isOrderModalVisible}
        onCancel={closeOrderModal}
        onOk={() => form.submit()}
        okText="OK"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          name="orderForm"
          onFinish={onFinishOrder}
          initialValues={{}}
        >
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa chỉ giao hàng"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { 
                required: true, 
                message: 'Vui lòng nhập email' 
              },
              { 
                type: 'email',
                message: 'Email không hợp lệ'
              }
            ]}
          >
            <Input />
          </Form.Item>

          {/* Liệt kê lại đơn hàng */}
          <Form.Item label={`Đơn hàng`}>
            <ul>
              {furnitures.map((item, idx) => (
                <li key={idx}>
                  {item.name} x{item.quantity ?? 1} - {(item.cost * (item.quantity ?? 1)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </li>
              ))}
            </ul>
            <p style={{fontWeight:700}}>Tổng cộng: ${toVN(totalCost)}</p>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default PanelFurnituresModal;

const toVN = (n) => {
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}