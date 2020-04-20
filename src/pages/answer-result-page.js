import React from "react"
import Layout from "../components/layout"
import Button from "../components/button"
import QuizHeader from "../components/quiz-header"
import Context from "../context/Context"
import IsUserHaveFreeQuestion, {
  IsSubsribtionOffer,
  СountUserQuestions,
} from "../utils/isUserHaveFreeQuestions"
import "../styles/index.scss"

const AnswerResultPage = ({ location }) => {
  const {
    isCorrect,
    correctAnswer,
    commentText,
    imgLink,
    timesUpAnswerTitleText,
  } = location.state || ""

  const { state, dispatch } = React.useContext(Context)

  // тут +1 вопрос (т.к. question-page появляется на миг след.вопрос)
  let currentQuestionNumber = СountUserQuestions()
  React.useEffect(() => {
    return dispatch({
      type: "COUNT_USER_QUESTIONS",
      payload: currentQuestionNumber + 1,
    })
  }, [])

  const maxIndex = parseInt(
    state.dictionary.info.correctAnswerTitleText.length - 1
  )

  const handleAnswerTitleChange = () => {
    if (parseInt(state.answerTitleIndex) === maxIndex) {
      dispatch({
        type: "ANSWER_TITLE_INDEX",
        payload: 0,
      })
    } else {
      dispatch({
        type: "ANSWER_TITLE_INDEX",
        payload: parseInt(state.answerTitleIndex) + 1,
      })
    }
  }

  const isUserHaveFreeQuestions = IsUserHaveFreeQuestion()
  const isSubsribtionOffer = IsSubsribtionOffer()

  if (state.isLoading) {
    return "Loading..."
  }
  return (
    <Layout>
      <div className="result-page">
        <QuizHeader />
        <div
          className={
            isCorrect
              ? "result-page__title--correct text-sm"
              : "result-page__title--incorrect text-sm"
          }
        >
          {isCorrect
            ? state.dictionary.info.correctAnswerTitleText[
                state.answerTitleIndex
              ]
            : timesUpAnswerTitleText // если из-за таймера
            ? state.dictionary.info.timesUpAnswerTitleText.replace(
                "{correctAnswer}",
                correctAnswer
              )
            : state.dictionary.info.incorrectAnswerTitleText[
                state.answerTitleIndex
              ].replace("{correctAnswer}", correctAnswer)}
        </div>

        <div className="result-page__img-wrapper text-gray">
          <img src={imgLink} alt="correct answer img" />
        </div>

        <div className="result-page__comment text-sm">{commentText}</div>
        <Button
          onClick={handleAnswerTitleChange}
          text="Continue"
          className="green"
          link={
            isUserHaveFreeQuestions
              ? "question-page"
              : isSubsribtionOffer
              ? "subsription-offer"
              : "final-page"
          }
        />
      </div>
    </Layout>
  )
}

export default AnswerResultPage
