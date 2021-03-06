import React from "react"
import { navigate } from "gatsby"
// import { useQueryParam, NumberParam, StringParam } from "use-query-params"
import Head from "../components/head"
import "../styles/index.scss"
import LastminLogo from "../images/lastmin-logo.svg"
import Context from "../context/Context"
import FacebookLogin from "react-facebook-login"
import IsUserHaveFreeQuestion, {
  IsSubsribtionOffer,
  СountUserQuestions,
} from "../utils/isUserHaveFreeQuestions"
import OpenGraph from "../components/openGraph"
import FbMessengerLogo from "../images/fb-msng-logo.svg"
import withErrorBoundary from "../components/errorHOC"

const LoginPage = ({ location }) => {
  const { state, dispatch } = React.useContext(Context)
  const fromMessenger =
    state.isBrowser && JSON.parse(localStorage.getItem("fromMessenger"))

  const responseFacebook = response => {
    console.log("FACEBOOK AUTH RESPONSE__", response)
    response.status !== "unkown" &&
      dispatch({
        type: "LOGIN",
        payload: {
          name: response.name,
          photo: response.picture.data.url,
          email: response.email,
          userID: response.userID, // fromMessenger ? state.userInfo.userID
        },
      })

    const lang = encodeURI(
      (state.isBrowser && localStorage.getItem("lang")) || state.lang
    )

    const userObject = `username=${encodeURI(response.name)}&email=${encodeURI(
      response.email
    )}&facebook_id=${encodeURI(response.userID)}&progress=${encodeURI(
      0
    )}&current_question=${encodeURI(0)}&stripe_id=${encodeURI(
      ""
    )}&payment_ok=${encodeURI(false)}&localize=${lang}`

    // <=========  наличие в системе или создание юзера ==============
    // не проверять, если fromMessenger (get_user был на index.js)
    fetch(
      `${state.url}/get_user?facebook_id=${response.userID}`, //fromMessenger ? state.userInfo.userID
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(response => {
        console.log("get_user response", response)
        if (response.status === 400) {
          fetch(`${state.url}/create_user`, {
            method: "POST",
            headers: {
              "cache-control": "no-cache",
              pragma: "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: userObject,
          }).then(response => {
            if (response.status !== 200) {
              console.log("CREATE USER FAILED:", response)
              return false
            } else {
              dispatch({
                type: "SET_AUTHENTICATED",
                payload: true,
              })
              return response.json()
            }
          })
        } else {
          return response.json()
        }
      })
      .then(user => user && updateLocalStoreFromServer(user))

    // обновление локального стейта из ответа от сервера
    const updateLocalStoreFromServer = user => {
      console.log("user from system", user)
      dispatch({
        type: "SET_AUTHENTICATED",
        payload: true,
      })
      dispatch({
        type: "SCORE",
        payload: user.progress || 0,
      })
      dispatch({
        type: "COUNT_USER_QUESTIONS",
        payload: user.current_question || 0,
      })
      dispatch({
        type: "ADD_SUBSCRIPTION",
        payload: user.payment_ok || false,
      })
      dispatch({
        type: "LANG",
        payload: user.localize || "EN",
      })
      dispatch({
        type: "STRIPE_ID",
        payload: user.stripe_id || "",
      })
    }
    navigate("/home-page", {
      state: { isReload: true, forceAuthorize: false }, // fromMessenger ? true :
    })
    response.status === "unkown" && navigate("/login-page")
  } // ====================================================>

  // <==============РЕДИРЕКТ АВТОРИЗОВАННОГО=================
  const isUserHaveFreeQuestions = IsUserHaveFreeQuestion()
  const isSubsribtionOffer = IsSubsribtionOffer()
  const userQuestions = СountUserQuestions()

  React.useEffect(() => {
    console.log("is user FROM MESSENGER", fromMessenger)
    return state.isBrowser && !localStorage.getItem("isAuthenticated")
      ? navigate("/login-page")
      : userQuestions === 0
      ? navigate("/quiz-start")
      : isUserHaveFreeQuestions
      ? navigate("/continue-page")
      : isSubsribtionOffer
      ? "subsription-offer"
      : "final-page"
  }, [
    state.isBrowser,
    userQuestions,
    isUserHaveFreeQuestions,
    isSubsribtionOffer,
  ]) // ====================================================>

  if (state.isLoading) {
    return "Loading..."
  }

  return (
    <>
      <Head />
      <OpenGraph />
      <div className="outer-container">
        <main className="inner-container">
          <div className="logo__wrapper">
            <img className="logo__img" src={LastminLogo} alt="LastminIQ logo" />
          </div>
          <div id="fbAuthorize">
            <a
              className="link-to-chat"
              target="__blank"
              href="https://m.me/lastmin.tv?ref=w11913721"
            >
              <CustonIcon />
              {fromMessenger
                ? state.dictionary.info.startBtnText || "Start Quiz"
                : state.dictionary.info.facebookBtnText ||
                  "LOG IN WITH MESSENGER"}
            </a>
            {/* <FacebookLogin
              appId={state.dictionary.settings.facebookToken} // на прод 630697047779114
              // appId="226488818440629" // for localhost
              fields="name,email,picture"
              onClick={console.log("")}
              callback={responseFacebook}
              icon="fa-facebook"
              disableMobileRedirect={true}
              className="fb-btn"
              textButton={
                fromMessenger
                  ? state.dictionary.info.startBtnText || "Start Quiz"
                  : state.dictionary.info.facebookBtnText ||
                    "LOG IN WITH FACEBOOK"
              }
              icon={fromMessenger ? null : <CustonIcon />}
              // isMobile={false}
              // redirectUri="https://iq.lastmin.tv"
            /> */}
          </div>
        </main>
      </div>
    </>
  )
}

export default LoginPage

const CustonIcon = () => (
  <img
    src={FbMessengerLogo}
    style={{ width: "28px", height: "28px", marginRight: "10px" }}
  />
)
