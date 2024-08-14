#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void userRegistration();
void userGenerateCredentials(); 
void userLogin();

struct userData
{   
    int userBankingId;
    char userId[60];  
    char userPassword[60];  
    char userName[30];
    char userMiddleName[30];
    char userSurName[30];
    int userDOB_Day;
    char userDOB_Month[30];  
    int userDOB_Year;
    char userCity[30];
    char userState[30];
    char userCountry[30];
    int userPinCode;
    int userPhoneNumber;
    char userMailId[30];
} detail;

int main()
{   
    int i;
    int userLogReg;

    printf("Welcome to BlueRay Banking Portal\n");

    for(i = 0; i < 5; i++)
    {
        printf("1: Login\n2: Register\n: ");
        scanf("%d", &userLogReg);

        if(userLogReg == 1 || userLogReg == 2)
        {
            printf("\n\n\n\n");
            break;
        }
        else if(i == 4)
            printf("Invalid Response, Attempts Expired!\nPlease try after some time...");
        else
            printf("Please enter from the following options\n");
    }

    switch (userLogReg)
    {
    case 1:
        printf("BlueRay Bank\n===Login Portal===\n\n");
        userLogin();
        break;
    case 2:
        printf("BlueRay Bank\n===Registration Portal===\n\n");
        userRegistration();
        break;
    default:
        break;
    }

       
    return 0;
}

void userRegistration()
{
    printf("Please Enter the following details for Registering with us\n");

    printf("Name: ");
    scanf("%s", detail.userName);
    
    printf("Middle Name: ");
    scanf("%s", detail.userMiddleName);

    printf("Surname: ");
    scanf("%s", detail.userSurName);

    printf("DOB Day: ");
    scanf("%d", &detail.userDOB_Day);

    printf("DOB Month: ");
    scanf("%s", detail.userDOB_Month);

    printf("DOB Year: ");
    scanf("%d", &detail.userDOB_Year);

    printf("City: ");
    scanf("%s", detail.userCity);

    printf("State: ");
    scanf("%s", detail.userState);

    printf("Country: ");
    scanf("%s", detail.userCountry);

    printf("Pincode: ");
    scanf("%d", &detail.userPinCode);

    printf("Phone Number: ");
    scanf("%d", &detail.userPhoneNumber);

    printf("Mail Id: ");
    scanf("%s", detail.userMailId);  

    userGenerateCredentials();
    main();
}

void userGenerateCredentials()
{
    char userDOB_Year_String[10], userDOB_Day_String[10];

    // Convert integer values to string
    sprintf(userDOB_Year_String, "%d", detail.userDOB_Year);
    sprintf(userDOB_Day_String, "%d", detail.userDOB_Day);

    // Generate userId
    strcpy(detail.userId, detail.userName);
    strcat(detail.userId, userDOB_Year_String);

    // Generate userPassword
    strcpy(detail.userPassword, detail.userSurName);
    strcat(detail.userPassword, userDOB_Day_String);
    strcat(detail.userPassword, detail.userDOB_Month);

    // Display credentials
    printf("\n\nYour Account has been Created\nPlease Note down your credentials\n");
    printf("User-ID: %s\n", detail.userId);
    printf("User Password: %s\n", detail.userPassword);
    printf("Banking Id: %d\n", detail.userBankingId);
}

void userLogin()
{   
    int i;
    char check_userId[30],check_userPassword[30];
    
    for(i=0;i<5;i++)
    {
        printf("Enter User-ID: ",detail.userId);
        scanf("%s",check_userId);

        printf("Enter Password: ",detail.userPassword);
        scanf("%s",check_userPassword);

        if(strcmp(check_userId,detail.userId) == 0 && strcmp(check_userPassword,detail.userPassword) == 0)
        {
            // mainMenu();
            break;
        }
    }
    
}