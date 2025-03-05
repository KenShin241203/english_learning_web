import { Modal, Rate, Input, Form, Button } from 'antd';
import { useEffect, useState, useContext } from 'react';
import { getUserReviewApi, createUserReviewApi } from '../../../services/api.review.service';
import { AuthContext } from '../../context/auth.context';

const { TextArea } = Input;

const ReviewUpdateModal = ({ visible, onClose, courseId, onRatingUpdate }) => {
    const [form] = Form.useForm();
    const { user } = useContext(AuthContext);

    // Fetch review data when modal is shown
    useEffect(() => {
        if (visible && user._id && courseId) {
            fetchReviewData();
        }
    }, [visible, user._id, courseId]);

    // Fetch review data for the user and course
    const fetchReviewData = async () => {
        try {
            const res = await getUserReviewApi(user._id, courseId);
            if (res.data) {
                form.setFieldsValue({
                    rating: res.data.review.rating,
                    content: res.data.review.content,
                })
            }
        } catch (error) {
            console.error('Failed to fetch review:', error);
        }
    };


    // Handle form submission to create/update review
    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                createUserReviewApi(user._id, courseId, values.rating, values.content)
                    .then(() => {
                        onRatingUpdate();
                        onClose();  // Close modal after review submission
                    })
                    .catch((error) => {
                        console.error('Failed to create/update review:', error);
                    });
            })
            .catch((info) => {
                console.log('Validation Failed:', info);
            });
    };

    return (
        <Modal
            title="Update Your Review"
            visible={visible}
            onOk={handleOk}
            onCancel={onClose}
            okText="Save"
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Your Rating"
                    name="rating"
                    rules={[{ required: true, message: 'Please rate the course!' }]}
                >
                    <Rate allowHalf />
                </Form.Item>

                <Form.Item
                    label="Your Review"
                    name="content"
                    rules={[{ required: true, message: 'Please provide a review!' }]}
                >
                    <TextArea rows={4} placeholder="Write your review here..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReviewUpdateModal;
