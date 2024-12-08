---
title: UE5 Handy Notes
description: 记录 UE5 中一些容易混淆的概念，方便记忆
date: 2024-10-16 00:00:00 +0800
categories: [Computer Grahics, UE5]
tags: [ue5]     # TAG names should always be lowercase
---

## Gameplay Ability System

```c++
/** The core ActorComponent for interfacing with the GameplayAbilities System */
UCLASS(ClassGroup=AbilitySystem, hidecategories=(Object,LOD,Lighting,Transform,Sockets,TextureStreaming), editinlinenew, meta=(BlueprintSpawnableComponent))
class GAMEPLAYABILITIES_API UAbilitySystemComponent : public UGameplayTasksComponent, public IGameplayTagAssetInterface, public IAbilitySystemReplicationProxyInterface
{
	...

	/** The actor that owns this component logically */
	UPROPERTY(ReplicatedUsing = OnRep_OwningActor)
	TObjectPtr<AActor> OwnerActor;

	/** The actor that is the physical representation used for abilities. Can be NULL */
	UPROPERTY(ReplicatedUsing = OnRep_OwningActor)
	TObjectPtr<AActor> AvatarActor;
	
	...

	void SetOwnerActor(AActor* NewOwnerActor);
	AActor* GetOwnerActor() const { return OwnerActor; }

	void SetAvatarActor_Direct(AActor* NewAvatarActor);
	AActor* GetAvatarActor_Direct() const { return AvatarActor; }

	...

	/** Returns the avatar actor for this component */
	AActor* GetAvatarActor() const;

	/** Changes the avatar actor, leaves the owner actor the same */
	void SetAvatarActor(AActor* InAvatarActor);
	
	...

	/**
	 *	Initialized the Abilities' ActorInfo - the structure that holds information about who we are acting on and who controls us.
	 *      OwnerActor is the actor that logically owns this component.
	 *		AvatarActor is what physical actor in the world we are acting on. Usually a Pawn but it could be a Tower, Building, Turret, etc, may be the same as Owner
	 */
	virtual void InitAbilityActorInfo(AActor* InOwnerActor, AActor* InAvatarActor);

	...
};
```

**OwnerActor** is the actor that logically owns this component.

**AvatarActor** is what physical actor in the world we are acting on. Usually a Pawn but it could be a Tower, Building, Turret, etc, may be the same as Owner.

```c++
/** Abilities define custom gameplay logic that can be activated by players or external game logic */
UCLASS(Blueprintable)
class GAMEPLAYABILITIES_API UGameplayAbility : public UObject, public IGameplayTaskOwnerInterface
{
	...

	// Abilities with these tags are blocked while this ability is active
	// 当这个技能（BlockAbilitiesWithTag 所属的技能）是激活状态时，带有这些标记（存储在 BlockAbilitiesWithTag 中的标记）的技能会被阻止执行
	FGameplayTagContainer BlockAbilitiesWithTag;

	// Tags to apply to activating owner while this ability is active.
	// 在这个技能（ActivationOwnedTags 所属的技能）激活时，将这些标记（存储在 ActivationOwnedTags 中的标记）应用到正在激活这个技能的所有者身上
	FGameplayTagContainer ActivationOwnedTags;

	// This ability can only be activated if the activating actor/component has all of these tags
	// 只有当激活的角色/组件具有以下所有标记（存储在 ActivationRequiredTags 中的标记）时，才能激活这个技能（ActivationRequiredTags 所属的技能）
	FGameplayTagContainer ActivationRequiredTags;

	// This ability is blocked if the activating actor/component has any of these tags
	// 如果激活的角色/组件具有以下这些标记（存储在 ActivationBlockedTags 中的标记）中的任何一个，这个技能（ActivationBlockedTags 所属的技能）会被阻止执行
	FGameplayTagContainer ActivationBlockedTags;

	...
};
```

## Actor

```c++
/* Struct of optional parameters passed to SpawnActor function(s). */
struct ENGINE_API FActorSpawnParameters
{
	FActorSpawnParameters();

	/* The Actor that spawned this Actor. (Can be left as NULL). */
	AActor* Owner;

	/* The APawn that is responsible for damage done by the spawned Actor. (Can be left as NULL). */
	/* 这个 APawn 对生成的 Actor 引发的伤害或其他游戏性事件负责，是发起者。举例来说，A 生成了一个武器 Actor，这个 Actor 在战斗中对 B 造成了伤害，那么这个武器 Actor 的 Instigator 就是 A，且 A 需是一个 APawn 类型。*/
	APawn*	Instigator;

	...
}
```

```c++
/**
 * Convenience template for constructing a gameplay object
 *
 * @param	Outer		the outer for the new object.  If not specified, object will be created in the transient package.
 * @param	Class		the class of object to construct
 * @param	Name		the name for the new object.  If not specified, the object will be given a transient name via MakeUniqueObjectName
 * @param	Flags		the object flags to apply to the new object
 * @param	Template	the object to use for initializing the new object.  If not specified, the class's default object will be used
 * @param	bCopyTransientsFromClassDefaults	if true, copy transient from the class defaults instead of the pass in archetype ptr (often these are the same)
 * @param	InInstanceGraph						contains the mappings of instanced objects and components to their templates
 * @param	ExternalPackage						Assign an external Package to the created object if non-null
 *
 * @return	a pointer of type T to a new object of the specified class
 */
template< class T >
FUNCTION_NON_NULL_RETURN_START
	T* NewObject(UObject* Outer, const UClass* Class, FName Name = NAME_None, EObjectFlags Flags = RF_NoFlags, UObject* Template = nullptr, bool bCopyTransientsFromClassDefaults = false, FObjectInstancingGraph* InInstanceGraph = nullptr, UPackage* ExternalPackage = nullptr)
FUNCTION_NON_NULL_RETURN_END
{
	...

	FStaticConstructObjectParameters Params(Class);
	Params.Outer = Outer;
	Params.Name = Name;
	Params.SetFlags = Flags;
	Params.Template = Template;
	Params.bCopyTransientsFromClassDefaults = bCopyTransientsFromClassDefaults;
	Params.InstanceGraph = InInstanceGraph;
	Params.ExternalPackage = ExternalPackage;

	...

	return Result;
}

/** 
 * Load an object. 
 * @see StaticLoadObject()
 */
template< class T > 
inline T* LoadObject( UObject* Outer, const TCHAR* Name, const TCHAR* Filename=nullptr, uint32 LoadFlags=LOAD_None, UPackageMap* Sandbox=nullptr, const FLinkerInstancingContext* InstancingContext=nullptr )
{
	return (T*)StaticLoadObject( T::StaticClass(), Outer, Name, Filename, LoadFlags, Sandbox, true, InstancingContext );
}
```
**Outer**: A UObject to set as the Outer for the Object being created.

## UCLASS macro

```c++
namespace UC
{
	// valid keywords for the UCLASS macro
	enum 
	{
		/// This keyword is used to set the actor group that the class is show in, in the editor.
		classGroup,

		/// Declares that instances of this class should always have an outer of the specified class.  This is inherited by subclasses unless overridden.
		Within, /* =OuterClassName */

		/// Exposes this class as a type that can be used for variables in blueprints. This is inherited by subclasses unless overridden.
		BlueprintType,

		/// Prevents this class from being used for variables in blueprints. This is inherited by subclasses unless overridden.
		NotBlueprintType,

		/// Exposes this class as an acceptable base class for creating blueprints. The default is NotBlueprintable, unless inherited otherwise. This is inherited by subclasses.
		Blueprintable,

		/// Specifies that this class is *NOT* an acceptable base class for creating blueprints. The default is NotBlueprintable, unless inherited otherwise. This is inherited by subclasses.
		NotBlueprintable,

		/// This keyword indicates that the class should be accessible outside of it's module, but does not need all methods exported.
		/// It exports only the autogenerated methods required for dynamic_cast<>, etc... to work.
		MinimalAPI,

		/// Prevents automatic generation of the constructor declaration.
		customConstructor,

		/// Prevents automatic generation of the FieldNotify declaration.
		CustomFieldNotify,

		/// Class was declared directly in C++ and has no boilerplate generated by UnrealHeaderTool.
		/// DO NOT USE THIS FLAG ON NEW CLASSES.
		Intrinsic,

		/// No autogenerated code will be created for this class; the header is only provided to parse metadata from.
		/// DO NOT USE THIS FLAG ON NEW CLASSES.
		noexport,

		/// Allow users to create and place this class in the editor.  This flag is inherited by subclasses.
		placeable,

		/// This class cannot be placed in the editor (it cancels out an inherited placeable flag).
		notplaceable,

		/// All instances of this class are considered "instanced". Instanced classes (components) are duplicated upon construction. This flag is inherited by subclasses. 
		DefaultToInstanced,

		/// All properties and functions in this class are const and should be exported as const.  This flag is inherited by subclasses.
		Const,

		/// Class is abstract and can't be instantiated directly.
		Abstract,

		/// This class is deprecated and objects of this class won't be saved when serializing.  This flag is inherited by subclasses.
		deprecated,

		/// This class can't be saved; null it out at save time.  This flag is inherited by subclasses.
		Transient,

		/// This class should be saved normally (it cancels out an inherited transient flag).
		nonTransient,

		/// This class is optional and might not be available in certain context. reference from non optional data type is not allowed.
		Optional,

		/// Load object configuration at construction time.  These flags are inherited by subclasses.
		/// Class containing config properties. Usage config=ConfigName or config=inherit (inherits config name from base class).
		config,
		/// Handle object configuration on a per-object basis, rather than per-class. 
		perObjectConfig,
		/// Determine whether on serialize to configs a check should be done on the base/defaults ini's
		configdonotcheckdefaults,

		/// Save object config only to Default INIs, never to local INIs.
		defaultconfig,

		/// Mark the editor config file to load from if loading into this object.
		EditorConfig,

		/// These affect the behavior of the property editor.
		/// Class can be constructed from editinline New button.
		editinlinenew,
		/// Class can't be constructed from editinline New button.
		noteditinlinenew,
		/// Class not shown in editor drop down for class selection.
		hidedropdown,

		/// Shows the specified categories in a property viewer. Usage: showCategories=CategoryName or showCategories=(category0, category1, ...)
		showCategories,
		/// Hides the specified categories in a property viewer. Usage: hideCategories=CategoryName or hideCategories=(category0, category1, ...)
		hideCategories,
		/// Indicates that this class is a wrapper class for a component with little intrinsic functionality (this causes things like hideCategories and showCategories to be ignored if the class is subclassed in a Blueprint)
		ComponentWrapperClass,
		/// Shows the specified function in a property viewer. Usage: showFunctions=FunctionName or showFunctions=(category0, category1, ...)
		showFunctions,
		/// Hides the specified function in a property viewer. Usage: hideFunctions=FunctionName or hideFunctions=(category0, category1, ...)
		hideFunctions,
		/// Specifies which categories should be automatically expanded in a property viewer.
		autoExpandCategories,
		/// Specifies which categories should be automatically collapsed in a property viewer.
		autoCollapseCategories,
		/// Clears the list of auto collapse categories.
		dontAutoCollapseCategories,
		/// Display properties in the editor without using categories.
		collapseCategories,
		/// Display properties in the editor using categories (default behaviour).
		dontCollapseCategories,
		/// Specifies category display order, unspecified will follow default display order.
		prioritizeCategories,

		/// All the properties of the class are hidden in the main display by default, and are only shown in the advanced details section.
		AdvancedClassDisplay,

		/// A root convert limits a sub-class to only be able to convert to child classes of the first root class going up the hierarchy.
		ConversionRoot,

		/// Marks this class as 'experimental' (a totally unsupported and undocumented prototype)
		Experimental,

		/// Marks this class as an 'early access' preview (while not considered production-ready, it's a step beyond 'experimental' and is being provided as a preview of things to come)
		EarlyAccessPreview,

		/// Some properties are stored once per class in a sidecar structure and not on instances of the class
		SparseClassDataType,

		/// Specifies the struct that contains the CustomThunk implementations
		CustomThunkTemplates
	};
}
```

## UINTERFACE macro 

```c++
namespace UI
{
	// valid keywords for the UINTERFACE macro, see the UCLASS versions, above
	enum 
	{
		/// This keyword indicates that the interface should be accessible outside of it's module, but does not need all methods exported.
		/// It exports only the autogenerated methods required for dynamic_cast<>, etc... to work.
		MinimalAPI,

		/// Specifies that this interface can be directly implemented by blueprints, this is implied if the interface has any blueprint events.
		Blueprintable,

		/// Specifies that this interface cannot be implemented by blueprints, equivalent to CannotImplementInterfaceInBlueprint metadata.
		NotBlueprintable,

		/// Sets IsConversionRoot metadata flag for this interface.
		ConversionRoot,
	};
}
```

## UFUNCTION and UDELEGATE macros

```c++
namespace UF
{
	// valid keywords for the UFUNCTION and UDELEGATE macros
	enum 
	{
		/// This function is designed to be overridden by a blueprint.  Do not provide a body for this function;
		/// the autogenerated code will include a thunk that calls ProcessEvent to execute the overridden body.
		BlueprintImplementableEvent,

		/// This function is designed to be overridden by a blueprint, but also has a native implementation.
		/// Provide a body named [FunctionName]_Implementation instead of [FunctionName]; the autogenerated
		/// code will include a thunk that calls the implementation method when necessary.
		BlueprintNativeEvent,

		/// This function is sealed and cannot be overridden in subclasses.
		/// It is only a valid keyword for events; declare other methods as static or final to indicate that they are sealed.
		SealedEvent,

		/// This function is executable from the command line.
		Exec,

		/// This function is replicated, and executed on servers.  Provide a body named [FunctionName]_Implementation instead of [FunctionName];
		/// the autogenerated code will include a thunk that calls the implementation method when necessary.
		Server,

		/// This function is replicated, and executed on clients.  Provide a body named [FunctionName]_Implementation instead of [FunctionName];
		/// the autogenerated code will include a thunk that calls the implementation method when necessary.
		Client,

		/// This function is both executed locally on the server and replicated to all clients, regardless of the Actor's NetOwner
		NetMulticast,

		/// Replication of calls to this function should be done on a reliable channel.
		/// Only valid when used in conjunction with Client, Server, or NetMulticast
		Reliable,

		/// Replication of calls to this function can be done on an unreliable channel.
		/// Only valid when used in conjunction with Client, Server, or NetMulticast
		Unreliable,

		/// This function fulfills a contract of producing no side effects, and additionally implies BlueprintCallable.
		BlueprintPure,

		/// This function can be called from blueprint code and should be exposed to the user of blueprint editing tools.
		BlueprintCallable,

		/// This function is used as the get accessor for a blueprint exposed property. Implies BlueprintPure and BlueprintCallable.
		BlueprintGetter,

		/// This function is used as the set accessor for a blueprint exposed property. Implies BlueprintCallable.
		BlueprintSetter,

		/// This function will not execute from blueprint code if running on something without network authority
		BlueprintAuthorityOnly,

		/// This function is cosmetic and will not run on dedicated servers
		BlueprintCosmetic,

		/// Indicates that a Blueprint exposed function should not be exposed to the end user
		BlueprintInternalUseOnly,
	
		/// This function can be called in the editor on selected instances via a button in the details panel.
		CallInEditor,

		/// The UnrealHeaderTool code generator will not produce a execFoo thunk for this function; it is up to the user to provide one.
		CustomThunk,

		/// Specifies the category of the function when displayed in blueprint editing tools.
		/// Usage: Category=CategoryName or Category="MajorCategory,SubCategory"
		Category,

		/// Generate a field entry for the NotifyFieldValueChanged interface.
		FieldNotify,

		/// This function must supply a _Validate implementation
		WithValidation,

		/// This function is RPC service request
		ServiceRequest,

		/// This function is RPC service response
		ServiceResponse,
		
		/// [FunctionMetadata]	Marks a UFUNCTION as accepting variadic arguments. Variadic functions may have extra terms they need to emit after the main set of function arguments
		///						These are all considered wildcards so no type checking will be performed on them
		Variadic,

		/// [FunctionMetadata] Indicates the display name of the return value pin
		ReturnDisplayName, 

		/// [FunctionMetadata] Indicates that a particular function parameter is for internal use only, which means it will be both hidden and not connectible.
		InternalUseParam, 

		// [FunctionMetadata] Indicates that the function should appear as blueprint function even if it doesn't return a value.
		ForceAsFunction, 

		/// [FunctionMetadata] Indicates that the function should be ignored when considered for blueprint type promotion
		IgnoreTypePromotion,
	};
}
```

## UPROPERTY macro

```c++
namespace UP
{
	// valid keywords for the UPROPERTY macro
	enum 
	{
		/// This property is const and should be exported as const.
		Const,

		/// Property should be loaded/saved to ini file as permanent profile.
		Config,

		/// Same as above but load config from base class, not subclass.
		GlobalConfig,

		/// Property should be loaded as localizable text. Implies ReadOnly.
		Localized,

		/// Property is transient: shouldn't be saved, zero-filled at load time.
		Transient,

		/// Property should always be reset to the default value during any type of duplication (copy/paste, binary duplication, etc.)
		DuplicateTransient,

		/// Property should always be reset to the default value unless it's being duplicated for a PIE session - deprecated, use NonPIEDuplicateTransient instead
		NonPIETransient,

		/// Property should always be reset to the default value unless it's being duplicated for a PIE session
		NonPIEDuplicateTransient,

		/// Value is copied out after function call. Only valid on function param declaration.
		Ref,

		/// Object property can be exported with it's owner.
		Export,

		/// Hide clear button in the editor.
		NoClear,

		/// Indicates that elements of an array can be modified, but its size cannot be changed.
		EditFixedSize,

		/// Property is relevant to network replication.
		Replicated,

		/// Property is relevant to network replication. Notify actors when a property is replicated (usage: ReplicatedUsing=FunctionName).
		ReplicatedUsing,

		/// Skip replication (only for struct members and parameters in service request functions).
		NotReplicated,

		/// Interpolatable property for use with cinematics. Always user-settable in the editor.
		Interp,

		/// Property isn't transacted.
		NonTransactional,

		/// Property is a component reference. Implies EditInline and Export.
		Instanced,

		/// MC Delegates only.  Property should be exposed for assigning in blueprints.
		BlueprintAssignable,

		/// Specifies the category of the property. Usage: Category=CategoryName.
		Category,

		/// Properties appear visible by default in a details panel
		SimpleDisplay,

		/// Properties are in the advanced dropdown in a details panel
		AdvancedDisplay,

		/// Indicates that this property can be edited by property windows in the editor
		EditAnywhere,

		/// Indicates that this property can be edited by property windows, but only on instances, not on archetypes
		EditInstanceOnly,

		/// Indicates that this property can be edited by property windows, but only on archetypes
		EditDefaultsOnly,

		/// Indicates that this property is visible in property windows, but cannot be edited at all
		VisibleAnywhere,
		
		/// Indicates that this property is only visible in property windows for instances, not for archetypes, and cannot be edited
		VisibleInstanceOnly,

		/// Indicates that this property is only visible in property windows for archetypes, and cannot be edited
		VisibleDefaultsOnly,

		/// This property can be read by blueprints, but not modified.
		BlueprintReadOnly,

		/// This property has an accessor to return the value. Implies BlueprintReadOnly if BlueprintSetter or BlueprintReadWrite is not specified. (usage: BlueprintGetter=FunctionName).
		BlueprintGetter,

		/// This property can be read or written from a blueprint.
		BlueprintReadWrite,

		/// This property has an accessor to set the value. Implies BlueprintReadWrite. (usage: BlueprintSetter=FunctionName).
		BlueprintSetter,

		/// The AssetRegistrySearchable keyword indicates that this property and it's value will be automatically added
		/// to the asset registry for any asset class instances containing this as a member variable.  It is not legal
		/// to use on struct properties or parameters.
		AssetRegistrySearchable,

		/// Property should be serialized for save games.
		/// This is only checked for game-specific archives with ArIsSaveGame set
		SaveGame,

		/// MC Delegates only.  Property should be exposed for calling in blueprint code
		BlueprintCallable,

		/// MC Delegates only. This delegate accepts (only in blueprint) only events with BlueprintAuthorityOnly.
		BlueprintAuthorityOnly,

		/// Property shouldn't be exported to text format (e.g. copy/paste)
		TextExportTransient,

		/// Property shouldn't be serialized, can still be exported to text
		SkipSerialization,

		/// If true, the self pin should not be shown or connectable regardless of purity, const, etc. similar to InternalUseParam
		HideSelfPin, 

		/// Generate a field entry for the NotifyFieldValueChanged interface.
		FieldNotify,
	};
}
```

## USTRUCT macro

```c++
namespace US
{
	// valid keywords for the USTRUCT macro
	enum 
	{
		/// No autogenerated code will be created for this class; the header is only provided to parse metadata from.
		NoExport,

		/// Indicates that this struct should always be serialized as a single unit
		Atomic,

		/// Immutable is only legal in Object.h and is being phased out, do not use on new structs!
		Immutable,

		/// Exposes this struct as a type that can be used for variables in blueprints
		BlueprintType,

		/// Indicates that a BlueprintType struct should not be exposed to the end user
		BlueprintInternalUseOnly,

		/// Indicates that a BlueprintType struct and its derived structs should not be exposed to the end user
		BlueprintInternalUseOnlyHierarchical,
	};
}
```

## Input Trigger

```c++
/**
Base class for building triggers.（用于构建触发器的基类）
Transitions to Triggered state once the input meets or exceeds the actuation threshold.（一旦输入达到或超过启动阈值，就会转换到已触发（Triggered）状态。）
*/
class ENHANCEDINPUT_API UInputTrigger : public UObject
{
	...
	// Point at which this trigger fires（这个触发器触发的点）
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings")
	float ActuationThreshold = 0.5f;

	/* Decides whether this trigger ticks every frame or not.
	 * This WILL affect performance and should only be used in specific custom triggers.
	 */
	UPROPERTY(Config, BlueprintReadOnly, Category = "Trigger Settings")
	bool bShouldAlwaysTick = false;
	...
};

/**
Base class for building triggers that have firing conditions governed by elapsed time.（用于构建触发器的基类，触发条件受运行时间的控制。）
This class transitions state to Ongoing once input is actuated, and will track Ongoing input time until input is released.（一旦输入被启动，该类就会将状态转换为持续（Ongoing）状态，并跟踪持续输入的时间，直到输入被释放。）
*/
class ENHANCEDINPUT_API UInputTriggerTimedBase : public UInputTrigger
{
	...
	// How long have we been actuating this trigger?（我们启动这个触发器多长时间了？）
	UPROPERTY(BlueprintReadWrite, Category = "Trigger Settings")
	float HeldDuration = 0.0f;
	...
};

/** UInputTriggerDown
	Trigger fires when the input exceeds the actuation threshold.（当输入超过启动阈值时触发器触发）
	Note: When no triggers are bound Down (with an actuation threshold of > 0) is the default behavior.
	*/
class UInputTriggerDown final : public UInputTrigger

/** UInputTriggerPressed
	Trigger fires once only when input exceeds the actuation threshold.（只有当输入超过启动阈值时，触发器触发一次）
	Holding the input will not cause further triggers.（按住输入不会造成再次触发。）
	*/
class UInputTriggerPressed final : public UInputTrigger

/** UInputTriggerReleased
	Trigger returns Ongoing whilst input exceeds the actuation threshold.（当输入超过启动阈值时触发器返回持续（Ongoing）状态）
	Trigger fires once only when input drops back below actuation threshold.（只有当输入回落到启动阈值时，触发器触发一次）
	*/
class UInputTriggerReleased final : public UInputTrigger

/** UInputTriggerHold
	Trigger fires once input has remained actuated for HoldTimeThreshold seconds.（在输入保持启动状态达到 HoldTimeThreshold 秒后触发器触发。）
	Trigger may optionally fire once, or repeatedly fire.（触发器可选择触发一次或重复触发。）
*/
class UInputTriggerHold final : public UInputTriggerTimedBase
{
	...
	// How long does the input have to be held to cause trigger?（输入需要保持多长时间才能引起触发？）
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings", meta = (ClampMin = "0"))
	float HoldTimeThreshold = 1.0f;

	// Should this trigger fire only once, or fire every frame once the hold time threshold is met?
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings")
	bool bIsOneShot = false;
	...
};

/** UInputTriggerHoldAndRelease
	Trigger fires when input is released after having been actuated for at least HoldTimeThreshold seconds.（当输入启动至少 HoldTimeThreshold 秒后被释放时触发器触发。）
*/
class UInputTriggerHoldAndRelease final : public UInputTriggerTimedBase 
{
	...
	// How long does the input have to be held to cause trigger?（输入需要保持多长时间才能引起触发？）
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings", meta = (ClampMin = "0"))
	float HoldTimeThreshold = 0.5f;
};

/** UInputTriggerTap
	Input must be actuated then released within TapReleaseTimeThreshold seconds to trigger.（输入必须在 TapReleaseTimeThreshold 秒内启动然后释放才能触发。）
*/
class UInputTriggerTap final : public UInputTriggerTimedBase
{
	...
	// Release within this time-frame to trigger a tap（在此时间范围内释放可触发轻拍）
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings", meta = (ClampMin = "0"))
	float TapReleaseTimeThreshold = 0.2f;
};

/** UInputTriggerPulse
	Trigger that fires at an Interval, in seconds, while input is actuated. （在输入启动时，触发器每间隔某一个时间（单位秒）就会触发）
	Note:	Completed only fires when the repeat limit is reached or when input is released immediately after being triggered.
			Otherwise, Canceled is fired when input is released.
	*/
class UInputTriggerPulse final : public UInputTriggerTimedBase
{
	...
	// Whether to trigger when the input first exceeds the actuation threshold or wait for the first interval?（是在输入首次超过启动阈值时就触发，还是等待满足第一个间隔时间时再触发？）
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings")
	bool bTriggerOnStart = true;

	// How long between each trigger fire while input is held, in seconds?（按住输入键时，每次触发器触发间隔多长时间（秒）？）
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings", meta = (ClampMin = "0"))
	float Interval = 1.0f;

	// How many times can the trigger fire while input is held? (0 = no limit)（按住输入键时，触发器可以触发多少次，0 表示没有次数限制）
	UPROPERTY(EditAnywhere, Config, BlueprintReadWrite, Category = "Trigger Settings", meta = (ClampMin = "0"))
	int32 TriggerLimit = 0;
	...
};

/**
 * UInputTriggerCombo
 * All actions in the combo array must be completed (based on combo completion event specified - triggered, completed, etc.) to trigger the action this trigger is on.（必须完成连招数组中的所有动作（基于指定的连招完成事件 - 已触发、已完成等）才能触发这个触发器上的动作。）
 * Actions must also be completed in the order specified by the combo actions array (starting at index 0).（动作也必须以连招动作数组中指定的顺序完成（以索引 0 开始）。）
 * Note: This will only trigger for one frame before resetting the combo trigger's progress 
 */
class ENHANCEDINPUT_API UInputTriggerCombo : public UInputTrigger
{
	...
	// Keeps track of what action we're currently at in the combo
	UPROPERTY(BlueprintReadOnly, Category = "Trigger Settings")
	int32 CurrentComboStepIndex = 0;
	
	// Time elapsed between last combo InputAction trigger and current time
	UPROPERTY(BlueprintReadOnly, Category = "Trigger Settings")
	float CurrentTimeBetweenComboSteps = 0.0f;
	...
	/**
	 * List of input actions that need to be completed (according to Combo Step Completion States) to trigger this action.
	 * Input actions must be triggered in order (starting at index 0) to count towards the triggering of the combo.
	 */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trigger Settings", meta = (DisplayThumbnail = "false", TitleProperty = "ComboStepAction"))
	TArray<FInputComboStepData> ComboActions;

	// Actions that will cancel the combo if they are completed (according to Cancellation States)
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trigger Settings", meta = (DisplayThumbnail = "false", DisplayName = "Cancel Actions"))
	TArray<FInputCancelAction> InputCancelActions;
	...
};
```