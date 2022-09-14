import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import Header from '../Header'
import Profile from '../Profile'
import JobItem from '../JobItem'
import Filters from '../Filters'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    searchInput: '',
    selectedJobTypes: [],
    selectedSalaryRange: '',
    jobsList: [],
  }

  componentDidMount() {
    this.getJobsData()
  }

  getJobsData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {searchInput, selectedJobTypes, selectedSalaryRange} = this.state
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs?employment_type=${selectedJobTypes.join(
      ',',
    )}&minimum_package=${selectedSalaryRange}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(url, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const formatedData = fetchedData.jobs.map(eachjob => ({
        companyLogoUrl: eachjob.company_logo_url,
        employmentType: eachjob.employment_type,
        id: eachjob.id,
        jobDescription: eachjob.job_description,
        location: eachjob.location,
        packagePerAnnum: eachjob.package_per_annum,
        rating: eachjob.rating,
        title: eachjob.title,
      }))
      this.setState({
        jobsList: formatedData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  selectedSalaryRange = selectedSalaryId => {
    this.setState({selectedSalaryRange: selectedSalaryId}, this.getJobsData)
  }

  selectedEmploymentType = (isChecked, selectedJobType) => {
    const {selectedJobTypes} = this.state
    if (isChecked) {
      const updatedJobTyepesList = [...selectedJobTypes, selectedJobType]
      this.setState({selectedJobTypes: updatedJobTyepesList}, this.getJobsData)
    } else {
      const updatedJobTypesList = selectedJobTypes.filter(
        eachJobType => eachJobType !== selectedJobType,
      )
      this.setState({selectedJobTypes: updatedJobTypesList}, this.getJobsData)
    }
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onClickSearch = () => {
    this.getJobsData()
  }

  renderJobsList = () => {
    const {jobsList} = this.state
    return jobsList.length === 0 ? (
      this.renderNoJobsView()
    ) : (
      <ul className="jobs-list-items">
        {jobsList.map(eachjob => (
          <JobItem key={eachjob.id} jobDetails={eachjob} />
        ))}
      </ul>
    )
  }

  renderNoJobsView = () => (
    <div className="no-data-found-container">
      <img
        alt="no jobs"
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        className="no-data-found-img"
      />
      <h1 className="no-data-found-heading">No Jobs Found</h1>
      <p className="no-data-found-description">
        We could not find any jobs. Try other filters.
      </p>
    </div>
  )

  renderLoadingView = () => (
    <div className="loader-container" testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  onClickRetry = () => {
    this.getJobsData()
  }

  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        alt="failure view"
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        className="failure-view-img"
      />
      <h1 className="failure-view-heading">Oops! Something Went Wrong</h1>
      <p className="failure-view-description">
        We cannot seem to find the page you are looking for
      </p>
      <button
        type="button"
        className="retry-button"
        onClick={this.onClickRetry}
      >
        Retry
      </button>
    </div>
  )

  renderJobs = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.success:
        return this.renderJobsList()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  renderSearchInput = () => {
    const {searchInput} = this.state
    return (
      <div className="search-input-container">
        <input
          placeholder="Search"
          type="search"
          value={searchInput}
          onChange={this.onChangeSearchInput}
          className="search-input"
        />
        <button
          onClick={this.onClickSearch}
          className="search-btn"
          testid="searchButton"
          type="button"
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  render() {
    return (
      <div className="jobs-container">
        <Header />
        <div className="jobs-responsive-container">
          <div className="mobile-search-input-container">
            {this.renderSearchInput()}
          </div>
          <div className="profile-and-filters-container">
            <Profile />

            <hr className="horizontal-line" />
            <Filters
              selectedEmploymentType={this.selectedEmploymentType}
              selectedSalaryRange={this.selectedSalaryRange}
            />
          </div>
          <div className="Jobs-list-container">
            <div className="desktop-search-input-container">
              {this.renderSearchInput()}
            </div>
            {this.renderJobs()}
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs
