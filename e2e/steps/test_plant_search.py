from e2e.conftest import to_planting_page, worker_id
from e2e.pages.home import HomePage
from e2e.pages.login import LoginPage
from e2e.pages.maps.create import MapCreatePage
from e2e.pages.maps.planting import MapPlantingPage
from e2e.pages.maps.management import MapManagementPage
from pytest_bdd import scenarios, given, when, then, parsers


scenarios("features/search_plants.feature")


@given(parsers.parse("I am on the {name} map page and I have selected the plant layer"))
def logged_in(
    hp: HomePage,
    lp: LoginPage,
    mmp: MapManagementPage,
    mcp: MapCreatePage,
    mpp: MapPlantingPage,
    name,
):
    to_planting_page(hp, lp, mmp, mcp, mpp, name + worker_id())
    mpp.check_plant_layer()


# Scenario 1 and 2: Searching for plants with exact and partial matches


@when(parsers.parse("I type {plant} into the search box"))
def search_a_plant(mpp: MapPlantingPage, plant):
    mpp.click_search_icon()
    mpp.fill_plant_search(plant)


@then(parsers.parse("the app should display {result} as first match"))
def results_should_be_shown(mpp: MapPlantingPage, result):
    mpp.expect_search_result_is_visible(result)


# Scenario 3: No match was found


@when(parsers.parse("I type {input} into the search box"))
def match_not_found(mpp: MapPlantingPage, input):
    mpp.click_search_icon()
    mpp.fill_plant_search(input)


@then(parsers.parse("no match can be found and a text is displayed"))
def info_nothing_found(mpp: MapPlantingPage):
    mpp.expect_no_plants_found_text_is_visible()
