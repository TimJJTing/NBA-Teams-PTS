# NBA Teams’ Performance Tracking System
The NBA Teams’ Performance Tracking System is a project aims to help users to track the performance of NBA teams from 2000 to 2009. With the assistance of this system, users are able to quickly become aware of win ranks of NBA teams during this 10 years’ period, the overall trend and also the team players’ information. The system requirements, also known as functional requirements, of the project are interactive exploration and filtering techniques.  

This is a semester project of the course Information Visualization (364.029) 
presented in summer 2016 by JIE-TING JIANG and PORNPAN SONGPRASOP under the supervision of [Univ.-Prof. DI Dr. Marc Streit](https://www.jku.at/en/institute-of-computer-graphics/about-us/team/marc-streit/).

## What is the dataset about?
The dataset used in this project is two collections of related dataset of NBA players and 33 NBA teams regular season records from 1946 to 2009. It was retrieved from [http://www.databasebasketball.com/stats_download.htm](http://www.databasebasketball.com/stats_download.htm).  
The following data and abbreviations are retrieved and used in this project:

Abbreviation| Stand for
------------|:------
Firstname   | First name of a player  
Lastname    | Last name of a player  
Team        | A team that palyer plays for  
Gp          | Game points  
pts         | Total points  
won         | Total games won  
lost        | Total games lost  
fta         | Free Throw Attempted  
fga         | Field Goal Attempted  
to          | Turnover  
oreb        | Offensive Rebounds  

Beside the existing data, four new data types were fostered:  
Abbreviation| Stand for
------------|:------
WinRate     | A percentage of total win games divided by total games  
WrRank      | A position based on winRate  
Name        | First name and last name of a player  
Effi        | Efficiency of a player or a team on a particular season  

Efficiency is calculated by using this formula: ( pts * 100 ) / ( ( fta * 0.44 ) + fga + to – oreb ). The formula is taken from http://www.databasebasketball.com/about/aboutstats.htm and is computed on a per season basis.

## User Tasks
Talking about user tasks, a question the come in to our mind was what every user would want to be fully aware of through the observation. The following is the list that we believe that users expect to able to accomplish after using our work:
 - Be able to know how proficiently NBA teams and NBA player has carried out
 - Be able to compare the win rank of NBA teams from 2000 to 2009
 - Be informed the number of winning games and losing games of a particular team in a particular season
 - Be able to compare the efficiency of the best team, the worst team and a chosen team

