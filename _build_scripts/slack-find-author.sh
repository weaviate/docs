#!/bin/bash
set -e

# A map of the github contributors that connects to @Slack handles
declare -A git_slack_map
git_slack_map=(
    ["Abdel Rodríguez"]="<@U03R5ELDHHB>"
    ["Andrzej Liszka"]="<@U036Y4GPB6W>"
    ["Bob van Luijt"]="<@U6P955HC4>"
    ["Connor Shorten"]="<@U03FRH53SUT>"
    ["Daniel Madalitso Phiri"]="<@U060UJ41YBC>"
    ["DanielleWashington"]="<@U088SBVDCET>"
    ["Dirk Kulawiak"]="<@U03MWHK4KV3>"
    ["Duda Nogueira"]="<@U05K3K9M82F>"
    ["dyma solovei"]="<@U07NGR323JR>"
    ["Erika Cardenas"]="<@U03RSSRAMLN>"
    ["Etienne Dilocker"]="<@UCZDBEZ5F>"
    ["iamleonie"]="<@U05EG4DEJMC>"
    ["Igor Lamas"]="<@U04MGB80F45>"
    ["Ivan Despot"]="<@U0872JK65FU>"
    ["John Trengrove"]="<@U03KPAE8Y7K>"
    ["JP Hwang"]="<@U0441J6PYGN>"
    ["Leonie"]="<@U05EG4DEJMC>"
    ["Loic Reyreaud"]="<@U05U2UU5BNK>"
    ["Marcin Antas"]="<@U01E5BJ3UV7>"
    ["m-newhauser"]="<@U07K9AJCG2F>"
    ["Mohamed Shahin"]="<@U05V4HPJ3M0>"
    ["Nate Wilkinson"]="<@U06SCMA8ZB9>"
    ["Parker Duckworth"]="<@U034QPLGSCU>"
    ["Philip Vollet"]="<@U0573N5V97A>"
    ["Sebastian Witalec"]="<@U03DENV56CR>"
    ["Shan-Weaviate"]="<@U05DKAH2ZL1>"
    ["Spiros"]="<@U07G6HDV0HK>"
    ["thomashacker"]="<@U056E1ZEM3L>"
    ["Victoria Slocum"]="<@U05K0QFGRGV>"
    ["Wera"]="<@U043TKSEU5V>"
)

# Get the Author name and map it to their Slack handle
git_hash=$(echo "$GITHUB_SHA" | cut -c1-7)
github_name="$(git log -1 $git_hash --pretty="%aN")"

if [ ${git_slack_map[$github_name]+_} ]; then
    export AUTHOR_NAME=${git_slack_map[$github_name]}
else
    export AUTHOR_NAME=$github_name
fi
