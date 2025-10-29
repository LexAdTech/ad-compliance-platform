import React, { useState } from 'react';
import { Header } from '../../components/Header/Header';
import styles from './ContactPage.module.css';

interface ContactPageProps {
    onNavigateHome: () => void;
    onNavigateArticles: () => void;
    onNavigateContact: () => void;
    onLoginClick: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
                                                            onNavigateHome,
                                                            onNavigateArticles,
                                                            onNavigateContact,
                                                            onLoginClick,
                                                        }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Имитация отправки формы
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Форма отправлена:', formData);
            setSubmitStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <Header
                currentPage="contact"
                onNavigateHome={onNavigateHome}
                onNavigateArticles={onNavigateArticles}
                onNavigateContact={onNavigateContact}
                onLoginClick={onLoginClick}
            />

            <main className={styles.main}>
                <div className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Свяжитесь с <span className={styles.blue}>нами</span>
                        </h1>
                        <p className={styles.heroDescription}>
                            Есть вопросы или предложения? Мы всегда рады помочь! Напишите нам,
                            и наш специалист свяжется с вами в ближайшее время.
                        </p>
                    </div>
                </div>

                <section className={styles.contactSection}>
                    <div className={styles.contactContent}>
                        <div className={styles.contactInfo}>
                            <h2 className={styles.contactTitle}>Наши контакты</h2>

                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>📧</div>
                                <div>
                                    <h3>Email</h3>
                                    <p>support@foxplus.ru</p>
                                </div>
                            </div>

                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>📞</div>
                                <div>
                                    <h3>Teлефон</h3>
                                    <p>+7 (777) 777-77-77</p>
                                </div>
                            </div>

                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>🕒</div>
                                <div>
                                    <h3>Время работы</h3>
                                    <p>Пн-Пт: 9:00 - 18:00</p>
                                    <p>Сб-Вс: выходной</p>
                                </div>
                            </div>

                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>📍</div>
                                <div>
                                    <h3>Адрес</h3>
                                    <p>Москва, ул. Примерная, д. 123</p>
                                </div>
                            </div>
                        </div>

                        <form className={styles.contactForm} onSubmit={handleSubmit}>
                            <h2 className={styles.formTitle}>Напишите нам</h2>

                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>
                                    Ваше имя *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message" className={styles.label}>
                                    Сообщение *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={6}
                                    className={styles.textarea}
                                    required
                                    disabled={isSubmitting}
                                    placeholder="Опишите ваш вопрос или предложение..."
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                            </button>

                            {submitStatus === 'success' && (
                                <div className={styles.successMessage}>
                                    ✅ Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className={styles.errorMessage}>
                                    ❌ Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.
                                </div>
                            )}
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};