import React, {Component} from 'react';
import '../../stylesheets/preuse_inspections.scss';
import '../../stylesheets/inspection_forms.scss';
import Setup from '../../components/inspections/setup';
import Takedown from '../../components/inspections/takedown';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Query, Mutation } from 'react-apollo';
import { getPreuseInspectionQuery, savePreuseMutation } from '../../queries/inspections';
import { RouteComponentProps } from 'react-router';

interface State {
  id: number | null,
  date: Date,
  instructions: {
    setup: {
      equipmentInstructions: string,
      elementInstructions: string,
      environmentInstructions: string,
    },
    takedown: {
      equipmentInstructions: string,
      elementInstructions: string,
      environmentInstructions: string,
    }
  },
  elementId: number,
  newComments: {
    setup:{
      Equipment: {content: string},
      Element: {content: string},
      Environment: {content: string}
    },
    takedown:{
      Equipment: {content: string},
      Element: {content: string},
      Environment: {content: string}
    }
  },
  setupAttributes: SetupAttributes | undefined,
  takedownAttributes: TakedownAttributes | undefined,
  alertMessage: {message: string[], type: string},
  changed: boolean
}

interface QueryResponse {
  id: number,
  setupEquipmentInstructions: string,
  setupElementInstructions: string,
  setupEnvironmentInstructions: string,
  takedownEquipmentInstructions: string,
  takedownElementInstructions: string,
  takedownEnvironmentInstructions: string,
  preuseInspection: {
    id: number
    setupAttributes: SetupAttributes,
    takedownAttributes: TakedownAttributes
  }
}

interface MutationResponse {
  data: {
    savePreuse: {
      status: string,
      errors: string[],
      preuseInspection: {
        id: number
        setupAttributes: SetupAttributes,
        takedownAttributes: TakedownAttributes
      }
    }
  }
}

interface MatchParams {
  element_id: string
}

interface SetupAttributes {
  id: number,
  sectionsAttributes: Section[]
}

interface TakedownAttributes {
  id: number,
  sectionsAttributes: Section[]
  climbsAttributes: Climb[]
}

interface Section {
  id: number,
  title: string,
  complete: boolean,
  commentsAttributes: {
    id: number,
    content: string,
    user: {
      fullname: string;
    }
  }[]
}

interface Climb {
  id: number;
  rope: {identifier: string};
  block1: number;
  block2: number;
  block3: number;
  block4: number;
}

interface User {
  fullname: string
}

class PreuseForm extends Component<RouteComponentProps<MatchParams>, State> {
  state = {
    id: null,
    date: new Date(),
    instructions: {
      setup: {
        equipmentInstructions: "",
        elementInstructions: "",
        environmentInstructions: "",
      },
      takedown: {
        equipmentInstructions: "",
        elementInstructions: "",
        environmentInstructions: "",
      }
    },
    elementId: parseInt(this.props.match.params.element_id),
    newComments: {
      setup:{
        Equipment: {content: ""},
        Element: {content: ""},
        Environment: {content: ""}
      },
      takedown:{
        Equipment: {content: ""},
        Element: {content: ""},
        Environment: {content: ""}
      }
    },
    alertMessage: {message: [], type: ""},
    changed: false,
    setupAttributes: undefined,
    takedownAttributes: undefined
  }

  resetTextboxes = (): void => {
    this.setState({
      newComments: {
        setup:{
          Equipment: {content: ""},
          Element: {content: ""},
          Environment: {content: ""}
        },
        takedown:{
          Equipment: {content: ""},
          Element: {content: ""},
          Environment: {content: ""}
        }
      }
    });
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
    if ((event.target.attributes as any).type.value === "number"){
      // changing climbs number from takedown
      const {name, value} = event.target;
      const climbId = parseInt(event.target.getAttribute('data-climbid'));
      
      this.setState((state: State) => {
        const {takedownAttributes} = state;
        const climb = takedownAttributes.climbsAttributes.find((c: Climb) => c.id === climbId);
        climb[name] = parseInt(value);
        return {takedownAttributes}
      })

    } else if ((event.target.attributes as any).type.value === "textarea") {
      // changing comment
      const {name, value} = event.target;
      const inspection = event.target.getAttribute("data-inspection");

      this.setState(state => {
        const newComments = state.newComments;
        newComments[inspection][name].content = value;
        return Object.assign({}, state, {newComments: newComments})
      });
    } else if ((event.target.attributes as any).type.value === "checkbox") {
      //chaning checkbox
      const {name, checked} = event.target;
      const inspection = event.target.getAttribute("data-inspection");
      
      this.setState((state: State) => {
        const newAttrs = state[`${inspection}Attributes`];
        newAttrs.sectionsAttributes.find(s => s.title === name).complete = checked;
        return Object.assign({}, state, {[`${inspection}Attributes`]: newAttrs})
      });
    }
    this.setState({changed: true, alertMessage: {message: [], type: ""}});
  }

  handleDateChange = (date: Date) => {
    this.setState({date: date})
  }

  // intentionally not using an arrow function so children will use the correct "this"
  renderUpdatedBy(users: User[]){
    if (users.length > 0) {
      return (
        <div className="updated-by form-group">
          <h3>Updated by:</h3>
          {users.map((user, i) => {
            return <React.Fragment key={i}>
              {user.fullname}<br/>
            </React.Fragment>
          })}
        </div>
      )
    }
  }

  gatherDataFromState = () => {
    const date: Date = this.state.date
    const formattedDate: string = date.getDate()  + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
    const setupAttributes: SetupAttributes = {
      id: this.state.setupAttributes.id,
      sectionsAttributes: JSON.parse(JSON.stringify(this.state.setupAttributes.sectionsAttributes))
    };

    //clean up unneeded user data from comments
    setupAttributes.sectionsAttributes.forEach((section: Section) => {
      section.commentsAttributes.forEach((comment: {user: User, content: string}) => {
        delete comment.user
      })
    })
    
    // TODO: this line below was let takedownAttributes = null. I might have broken something with this
    let takedownAttributes: TakedownAttributes;
    if (this.state.takedownAttributes){
      const climbsCopy = JSON.parse(JSON.stringify(this.state.takedownAttributes.climbsAttributes));
      const climbsReduced = climbsCopy.map((climb: Climb) => {
        delete climb["rope"];
        return climb;
      })

      takedownAttributes = {
        id: this.state.takedownAttributes.id,
        sectionsAttributes: JSON.parse(JSON.stringify(this.state.takedownAttributes.sectionsAttributes)),
        climbsAttributes: climbsReduced
      } // used JSON to deeply copy the state array - lodash is an alternative if I want to import it
      
      //clean up unneeded user data from comments
      takedownAttributes.sectionsAttributes.forEach((section: Section) => {
        section.commentsAttributes.forEach((comment: {user: User, content: string}) => {
          delete comment.user
        })
      })
    }
    
    const data = {
      id: this.state.id,
      date: formattedDate,
      elementId: this.state.elementId,
      setupAttributes: setupAttributes,
      takedownAttributes: takedownAttributes
    };

    for(const insp in this.state.newComments){
      if (insp === "takedown" && takedownAttributes === null){
        continue;
      }
      for(const sectionTitle in this.state.newComments[insp]){
        if (data[`${insp}Attributes`]){
          const section = data[`${insp}Attributes`].sectionsAttributes.find((s: Section) => s.title === sectionTitle);

          section.commentsAttributes.push({
            id: null,
            content: this.state.newComments[insp][sectionTitle].content
          })
        }
      }
    }

    return data;
  }
// TODO: figure out the typing of the graphql mutation
  handleSubmit = (event: React.FormEvent<HTMLFormElement>, savePreuseMutation) => {
    event.preventDefault();
    const data = this.gatherDataFromState();

    savePreuseMutation({
      variables: {data: data}
    }).then(({data: {savePreuse: {status, errors, preuseInspection}}}: MutationResponse) => {
      if (status === "200"){
        this.props.history.push(`/preuse_inspections/elements/${this.state.elementId}/edit`);
        this.setState({
          ...preuseInspection,
          alertMessage: {
            type: "success",
            message: ["Inspection successfully saved"]
          },
          changed: false
        }, () => this.resetTextboxes());
      } else {
        this.setState({
          alertMessage: {
            type: "",
            message: errors
          }
        })
      }
    })
  }

  renderAlert = () => {
    const alerts = this.state.alertMessage;
    if (Object.keys(alerts).length > 0) {
      return (
        <div className={`alert alert-${alerts.type}`}>
        <ul>
            {alerts.message.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )
    }
  }

  queryCompleted = (resp: QueryResponse) => {
    if (resp.preuseInspection.id !== null){
      this.props.history.push(`/preuse_inspections/elements/${resp.id}/edit`);
      this.setState({
        alertMessage: {
          type:"info",
          message:["Previous inspection loaded"]
        },
        changed: false
      });
    } else {
      this.props.history.push(`/preuse_inspections/elements/${resp.id}/new`);
      this.setState({alertMessage: {message: [], type: ""}, changed: false});
    }
    this.resetTextboxes();
    this.updateStateFromQuery(resp);
  }

  updateStateFromQuery = (data: QueryResponse) => {
    this.setState({
      id: data.preuseInspection.id,
      setupAttributes: data.preuseInspection.setupAttributes,
      takedownAttributes: data.preuseInspection.takedownAttributes,
      instructions: {
        setup: {
          equipmentInstructions: data.setupEquipmentInstructions,
          elementInstructions: data.setupElementInstructions,
          environmentInstructions: data.setupEnvironmentInstructions,
        },
        takedown: {
          equipmentInstructions: data.takedownEquipmentInstructions,
          elementInstructions: data.takedownElementInstructions,
          environmentInstructions: data.takedownEnvironmentInstructions,
        }
      }
    });
  }

  render() {
    return (
      <Query
        query={getPreuseInspectionQuery}
        variables={{
          elementId: this.state.elementId,
          date: this.state.date.getDate() + "/" + (this.state.date.getMonth()+1) + "/" + this.state.date.getFullYear()
        }}
        fetchPolicy="network-only"
        onCompleted={(data: {element: QueryResponse})=> this.queryCompleted(data.element)}
        onError={(error: any) => console.log(error)}>

        {({loading}: {loading: boolean}) => {
          if (loading) return null;
          return <>
          {this.renderAlert()}

          <div id="preuse-inspection-form">
            <Mutation mutation={savePreuseMutation}>
              {(savePreuseMutation) => (
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) =>this.handleSubmit(e, savePreuseMutation)} >
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <DatePicker selected={this.state.date} name="date" className="form-control-sm" onChange={this.handleDateChange} />
                  </div>

                  {this.state.setupAttributes ?
                    <Setup data={this.state.setupAttributes}
                      renderUpdatedBy={this.renderUpdatedBy}
                      handleChange={this.handleChange}
                      instructions={this.state.instructions.setup}
                      newComments={this.state.newComments.setup}
                    /> : null
                  }

                  {this.state.takedownAttributes ?
                    <><hr /><Takedown data={this.state.takedownAttributes}
                      renderUpdatedBy={this.renderUpdatedBy}
                      handleChange={this.handleChange}
                      instructions={this.state.instructions.takedown}
                      newComments={this.state.newComments.takedown}
                    /></> : null
                  }

                  <input type="submit" id="submit-button" value={this.state.changed ? "Submit": "No changes yet"} disabled={!this.state.changed}/>
                </form>
              )}
            </Mutation>
            </div>
          </>
        }}
      </Query>
    )
  }
}

export default PreuseForm;