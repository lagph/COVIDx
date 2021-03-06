import React, { useState } from 'react';
import HowAreYouFeeling from "./HowAreYouFeeling";
import { Field, Formik } from "formik";
import { Button } from "reactstrap";
import Wizard from "../../../components/@vuexy/wizard/WizardComponent"
import "rc-slider/assets/index.css"
import "../../../assets/scss/plugins/extensions/slider.scss"
import {
  symptom_names_and_labels,
  underlying_condition_names_and_labels,
} from './QuestionSpecs'
import { NotWellPage, THERM_DEFAULT } from './NotWell';
import { TestedPage, HouseholdTestedPage } from './Tested';
import MedicalHistoryPage from './MedicalHistory';
import LocationFinder from './LocationFinder';
import { connect } from "react-redux";
import { setAuth } from "redux/actions/auth/authAction";

const FormSubmitted = props => {
  return (<div>
    <h2 className="pb-1">Thank you for your help!</h2>
    <h4 className="py-1">Report successfully submitted.</h4>
    <h4 className="py-1">Check back in tomorrow to continue the fight against COVID-19!</h4>
  </div>)
}

// Override default Wizard behaviour so we can go back to HowAreYouFeeling
const WizardStep = props => {
  const [nextDisabled, setNextDisabled] = useState(("nextDisabled" in props));
  return (
    <div>
      <props.component {...props}
        setNextDisabled={setNextDisabled}
      />
      {
        ("final" in props) &&
        !props.auth.login.isAuthenticated &&
        !localStorage.getItem("user_info") &&
        <div style={{ textAlign: "right", padding: "1rem 0" }}>
          <i>Please log in to save your results</i>
        </div>
      }
      <div className="wizard-actions d-flex justify-content-between">
        <Button color="primary" onClick={props.onPrev}>
          Prev
        </Button>
        <Button color="primary" onClick={props.onNext} disabled={nextDisabled}>
          {
            ("final" in props) ? "Submit" : "Next"
          }
        </Button>
      </div>
    </div >
  )
}
const mapStateToProps = state => ({ auth: state.auth });
const ConnectedWizardStep = connect(mapStateToProps, { setAuth })(WizardStep);


const NotWellWizard = props => {
  const [activeStep, setActiveStep] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  let steps = [
    {
      title: 1, content: <ConnectedWizardStep
        component={LocationFinder}
        onPrev={props.backToStart}
        onNext={() => setActiveStep(activeStep + 1)}
        values={props.values}
      //   nextDisabled
      />
    },
    {
      title: 2, content: <ConnectedWizardStep
        component={NotWellPage}
        onPrev={() => setActiveStep(activeStep - 1)}
        onNext={() => { setActiveStep(activeStep + 1) }}
        values={props.values}
      />
    },
    {
      title: 3, content: <ConnectedWizardStep
        component={TestedPage}
        onPrev={() => setActiveStep(activeStep - 1)}
        onNext={() => setActiveStep(activeStep + 1)}
        values={props.values}
      />
    },
    {
      title: 4, content: <ConnectedWizardStep
        component={MedicalHistoryPage}
        onPrev={() => setActiveStep(activeStep - 1)}
        onNext={props.onSubmit}
        values={props.values}
        final
        nextDisabled
      />
    },
  ]
  return <>
    {
      !formSubmitted
        ? (<Wizard
          steps={steps}
          onFinish={() => {
            props.submitForm();
            setFormSubmitted(true);
          }
          }
          activeStep={activeStep}
          pagination={false} />)
        : (<FormSubmitted />)
    }
  </>
}

const FeelingWellWizard = props => {
  const [activeStep, setActiveStep] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  let steps = [
    {
      title: 1, content: <ConnectedWizardStep
        component={LocationFinder}
        onPrev={props.backToStart}
        onNext={() => setActiveStep(activeStep + 1)}
        values={props.values}
      //   nextDisabled
      />
    },
    {
      title: 2, content: <ConnectedWizardStep
        component={HouseholdTestedPage}
        onPrev={() => setActiveStep(activeStep - 1)}
        onNext={() => setActiveStep(activeStep + 1)}
        values={props.values}
        nextDisabled
      />
    },
    {
      title: 3, content: <ConnectedWizardStep
        component={MedicalHistoryPage}
        onPrev={() => setActiveStep(activeStep - 1)}
        onNext={props.onSubmit}
        values={props.values}
        nextDisabled
        final
      />
    },
  ]
  return <>
    {
      !formSubmitted
        ? (<Wizard
          steps={steps}
          onFinish={() => {
            props.submitForm();
            setFormSubmitted(true);
          }
          }
          activeStep={activeStep}
          pagination={false} />)
        : (<FormSubmitted />)
    }
  </>
}


class SelectQuestionnaire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0
    }
  }

  handleUpdate = update => {
    this.setState(update);
  };

  render() {
    switch (this.state.activeStep) {
      case 0: return <Field component={HowAreYouFeeling} handler={this.handleUpdate} />;
      case 1: return <FeelingWellWizard
        values={this.props.values}
        submitForm={this.props.submitForm}
        backToStart={() => this.setState({ activeStep: 0 })}
      />;
      case 2: return <NotWellWizard
        validateField={this.props.validateField}
        values={this.props.values}
        submitForm={this.props.submitForm}
        backToStart={() => this.setState({ activeStep: 0 })}
      />;
      default: throw new Error(`Invalid activeStep ${this.props.activeStep}`)
    }
  }
}

var initialValues = {};

for (let names_and_labels of [
  underlying_condition_names_and_labels,
  symptom_names_and_labels
]) {
  for (let spec of names_and_labels) {
    initialValues[spec.name] = false;
  }
}

initialValues.location = null
initialValues.self_tested = null
initialValues.self_tested_date = null
initialValues.household_tested = null
initialValues.household_tested_date = null
initialValues.sex = null
initialValues.age = 33
initialValues.temp_guess = null
initialValues.therm_temp = THERM_DEFAULT

const handleSubmit = values => {
  if (values.self_tested_date instanceof Date) {
    values.self_tested_date = (values.self_tested_date.getYear() + 1900) + "-" + values.self_tested_date.getMonth() + "-" + values.self_tested_date.getDate();
  }
  if (values.household_tested_date instanceof Date) {
    values.household_tested_date = (values.household_tested_date.getYear() + 1900) + "-" + values.household_tested_date.getMonth() + "-" + values.household_tested_date.getDate();
  }
  console.log(values);
  if (values.has_thermometer) {
    delete values.temp_guess;
  } else if (values.has_thermometer === false) {
    delete values.therm_temp
  }
  delete values.has_thermometer
  delete values.location
  const postPayload = {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(values)
  }
  const postData = async () => {
    await fetch(`https://www.covidx.app/create_survey_response`, postPayload)
      .then(res => {
        console.log(res);
        return res.text();
      })
      .then(json => console.log(json))
      .catch(e => console.log(e));
  }

  postData();
}

const Questionnaire = (props) => {
  return (<Formik
    initialValues={initialValues}
    onSubmit={handleSubmit}>
    {(props) => (
      <SelectQuestionnaire values={props.values} submitForm={props.submitForm}
        validateField={props.validateField} />
    )}
  </Formik >
  );
}

export default Questionnaire;
