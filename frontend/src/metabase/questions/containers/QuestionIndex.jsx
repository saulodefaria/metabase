import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { Motion, spring, presets } from "react-motion";
import Collapse from "react-collapse";

import Icon from "metabase/components/Icon";
import Button from "metabase/components/Button";
import TitleAndDescription from "metabase/components/TitleAndDescription";
import ExpandingSearchField from "../components/ExpandingSearchField";
import CollectionActions from "../components/CollectionActions";

import CollectionButtons from "../components/CollectionButtons"

import EntityList from "./EntityList";

import { search } from "../questions";
import { loadCollections } from "../collections";
import { getUserIsAdmin } from "metabase/selectors/user";

import { replace, push } from "react-router-redux";

const mapStateToProps = (state, props) => ({
    items: state.questions.entities.cards,
    sectionId: state.questions.section,
    collections: state.collections.collections,

    isAdmin: getUserIsAdmin(state, props)
})

const mapDispatchToProps = ({
    search,
    loadCollections,
    replace,
    push,
})

@connect(mapStateToProps, mapDispatchToProps)
export default class QuestionIndex extends Component {
    constructor (props) {
        super(props);
        this.state = {
            questionsExpanded: true
        }
    }
    componentWillMount () {
        this.props.loadCollections();
    }

    render () {
        const { collections, replace, push, location, isAdmin } = this.props;
        const { questionsExpanded } = this.state;
        const hasCollections = collections.length > 0;
        const showCollections = isAdmin || hasCollections;
        return (
            <div className="relative mx4">
                <div className="flex align-center pt4 pb2">
                    <TitleAndDescription title={ showCollections ? "Collections of Questions" : "Saved Questions" } />
                    <div className="flex align-center ml-auto">
                        <ExpandingSearchField className="mr2" onSearch={this.props.search} />

                        <CollectionActions>
                            { isAdmin && hasCollections &&
                                <Link to="/collections/permissions">
                                    <Icon name="lock" tooltip="Set permissions for collections" />
                                </Link>
                            }
                            <Link to="/questions/archive">
                                <Icon name="viewArchive" tooltip="View the archive" />
                            </Link>
                        </CollectionActions>
                    </div>
                </div>
                { showCollections &&
                    <div className="mb2">
                        { collections.length > 0 ?
                            <CollectionButtons collections={collections} isAdmin={isAdmin} push={push} />
                        :
                            <CollectionEmptyState />
                        }
                    </div>
                }
                { showCollections &&
                    <div
                        className="inline-block mt2 mb2 cursor-pointer text-brand-hover"
                        onClick={() => this.setState({ questionsExpanded: !questionsExpanded })}
                    >
                        <div className="flex align-center">
                            <Motion defaultStyle={{ deg: 0 }} style={{ deg: questionsExpanded ? spring(0, presets.gentle) : spring(-90, presets.gentle) }}>
                                { motionStyle =>
                                    <Icon
                                        className="ml1 mr1"
                                        name="expandarrow"
                                        style={{
                                            transform: `rotate(${motionStyle.deg}deg)`
                                        }}
                                    />
                                }
                            </Motion>
                            <h2>Everything Else</h2>
                        </div>
                    </div>
                }
                <Collapse isOpened={questionsExpanded || !showCollections} keepCollapsedContent={true}>
                    <EntityList
                        entityType="cards"
                        entityQuery={{ f: "all", collection: "", ...location.query }}
                        // use replace when changing sections so back button still takes you back to collections page
                        onChangeSection={(section) => replace({
                            ...location,
                            query: { ...location.query, f: section }
                        })}
                        defaultEmptyState="Questions that aren’t in a collection will be shown here"
                    />
                </Collapse>
            </div>
        )
    }
}

const CollectionEmptyState = () =>
    <div className="flex align-center p2 bordered border-med border-brand rounded bg-grey-0 text-brand">
        <Icon name="collection" size={32} className="mr2"/>
        <div className="flex-full">
            <h3>Create collections for your saved questions</h3>
            <div className="mt1">
                Collections help you organize your questions and allow you to decide who gets to see what.
                {" "}
                <Link to="http://metabase.com/FIXME">Learn more</Link>
            </div>
        </div>
        <Link to="/collections/create">
            <Button primary>Create a collection</Button>
        </Link>
    </div>
