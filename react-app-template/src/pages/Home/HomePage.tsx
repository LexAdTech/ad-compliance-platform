import React, { useState } from 'react';
import { Header } from '../../components/Header/Header';
import  SvgIcon  from '../../components/Common/SvgIcon';
import { useAuthContext } from '../../contexts/AuthContext';
import styles from './HomePage.module.css';
//fasd
interface HomePageProps {
  onNavigateArticles: () => void;
  onLoginClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateArticles,
  onLoginClick,
}) => {
  const [adText, setAdText] = useState('');
  const [checkResultVisible, setCheckResultVisible] = useState(false);
  const [detailedTextHidden, setDetailedTextHidden] = useState(false);

  const { isLoggedIn } = useAuthContext();

  const handleCheck = () => {
    if (adText.trim()) {
      setCheckResultVisible(true);
      setDetailedTextHidden(false);
    }
  };

  const handleDetailedResultLogin = () => {
    onLoginClick();
  };

  return (
    <div className={styles.container}>
      <Header
        currentPage="home"
        onNavigateHome={() => {}} // Пустая функция, так как уже на домашней
        onNavigateArticles={onNavigateArticles}
        onLoginClick={onLoginClick}
      />

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Фокс<span className={styles.blue}>Плюс</span>: юридические{' '}
            <span className={styles.orange}>рекомендации</span> по рекламе
          </h1>
          <p className={styles.heroDescription}>
            Сервис для быстрой проверки рекламы на соответствие закону. Мы анализируем текст,
            изображения и аудио с помощью высокотехнологичного алгоритма, находим риски и
            подсказываем, как их исправить. С нами ваша реклама под защитой!
          </p>
          <SvgIcon className={styles.heroImage} />
        </div>

        <section className={styles.checkSection}>
          <div className={styles.checkTitle}>Введите текст вашей рекламы....</div>
          <textarea
            value={adText}
            onChange={(e) => setAdText(e.target.value)}
            rows={5}
            className={styles.textarea}
            placeholder="Введите текст рекламы для проверки..."
          />
          <button
            onClick={handleCheck}
            className={styles.checkButton}
          >
            Проверить
          </button>

          {checkResultVisible && (
            <div className={styles.result}>
              {!isLoggedIn ? (
                <>
                  <div className={styles.errorMessage}>
                    Неправильно! Рекламный текст содержит утверждения, которые не подтверждены
                    достоверными научными данными, отсутствует обязательное предупреждение о том,
                    что продукт не является лекарственным средством, а также неполно раскрыты условия акции.
                  </div>
                  <div className={styles.prompt}>
                    Хотите узнать подробнее?
                  </div>
                  <button
                    onClick={handleDetailedResultLogin}
                    className={styles.loginPromptButton}
                  >
                    Войти
                  </button>
                </>
              ) : (
                <>
                  {!detailedTextHidden && (
                    <div className={styles.detailedResult}>
                      <h3>Краткая оценка соответствия рекламы законодательству</h3>
                      <p>
                        Рекламный текст содержит утверждения, которые не подтверждены достоверными
                        клиническими данными, отсутствует обязательное предупреждение о том, что
                        продукт не является лекарственным средством, а также неполно раскрыты условия акции.
                      </p>

                      <h3>Анализ в разрезе законодательства</h3>
                      <h4>Недостоверная (вводящая в заблуждение) реклама</h4>
                      <p>
                        Согласно части 1 статьи 5 Федерального закона «О рекламе», реклама должна быть
                        добросовестной и достоверной, не содержать недостоверных сведений о товаре.
                      </p>

                      <h4>Обязательные предупреждения</h4>
                      <p>
                        Для рекламы продуктов, влияющих на здоровье, в соответствии с пунктом 1 части 1
                        и частью 1.1 статьи 25 закона, акцент делается на том, что такие продукты не
                        являются лекарственными средствами.
                      </p>

                      <h4>Информация об акциях и скидках</h4>
                      <p>
                        Объявляя об акциях и скидках, необходимо указывать все существенные условия.
                      </p>

                      <h4>Юридические риски</h4>
                      <p>
                        Несоблюдение требований законодательства о рекламе может привести к
                        административной ответственности по статье 14.3 КоАП РФ.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setDetailedTextHidden(!detailedTextHidden)}
                    className={styles.toggleDetailsButton}
                  >
                    {detailedTextHidden ? 'Показать подробности' : 'Скрыть'}
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

